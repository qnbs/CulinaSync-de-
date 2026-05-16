export type WorkerJobPriority = 0 | 1 | 2 | 3;

export type WorkerBusTelemetryHandler = (event: {
  jobId: string;
  priority: WorkerJobPriority;
  queueDepth: number;
  durationMs: number;
  phase: 'enqueue' | 'start' | 'complete' | 'error';
}) => void;

type JobPayload = {
  id: string;
  priority: WorkerJobPriority;
  run: () => Promise<void>;
};

/**
 * Zentrale Worker-Warteschlange mit 4 Prioritätsstufen (0 = niedrig, 3 = kritisch).
 * Intensivere ML-Workloads laufen in dedizierten Workern; der Bus serialisiert/scheduliert Jobs.
 */
export class WorkerBus {
  private readonly queues: Map<WorkerJobPriority, JobPayload[]> = new Map([
    [0, []],
    [1, []],
    [2, []],
    [3, []],
  ]);

  private active = 0;

  private readonly maxConcurrent: number;

  private readonly onTelemetry?: WorkerBusTelemetryHandler;

  private jobCounter = 0;

  public constructor(options?: { maxConcurrent?: number; onTelemetry?: WorkerBusTelemetryHandler }) {
    this.maxConcurrent = options?.maxConcurrent ?? Math.min(4, typeof navigator !== 'undefined' ? (navigator.hardwareConcurrency ?? 4) : 4);
    this.onTelemetry = options?.onTelemetry;
  }

  public enqueue(run: () => Promise<void>, priority: WorkerJobPriority = 1): string {
    const id = `job-${Date.now()}-${this.jobCounter += 1}`;
    const job: JobPayload = { id, priority, run };
    const list = this.queues.get(priority);
    if (!list) {
      throw new Error(`Invalid priority: ${String(priority)}`);
    }
    list.push(job);
    this.emitTelemetry({ jobId: id, priority, queueDepth: this.depth(), durationMs: 0, phase: 'enqueue' });
    void this.pump();
    return id;
  }

  public depth(): number {
    let total = 0;
    for (const q of this.queues.values()) {
      total += q.length;
    }
    return total + this.active;
  }

  private pickNext(): JobPayload | undefined {
    const priorities: WorkerJobPriority[] = [3, 2, 1, 0];
    for (const p of priorities) {
      const q = this.queues.get(p);
      const next = q?.shift();
      if (next) {
        return next;
      }
    }
    return undefined;
  }

  private async pump(): Promise<void> {
    if (this.active >= this.maxConcurrent) {
      return;
    }
    const job = this.pickNext();
    if (!job) {
      return;
    }
    this.active += 1;
    const started = performance.now();
    this.emitTelemetry({
      jobId: job.id,
      priority: job.priority,
      queueDepth: this.depth(),
      durationMs: 0,
      phase: 'start',
    });
    try {
      await job.run();
      this.emitTelemetry({
        jobId: job.id,
        priority: job.priority,
        queueDepth: this.depth(),
        durationMs: performance.now() - started,
        phase: 'complete',
      });
    } catch (e) {
      this.emitTelemetry({
        jobId: job.id,
        priority: job.priority,
        queueDepth: this.depth(),
        durationMs: performance.now() - started,
        phase: 'error',
      });
      throw e;
    } finally {
      this.active -= 1;
      void this.pump();
    }
  }

  private emitTelemetry(event: {
    jobId: string;
    priority: WorkerJobPriority;
    queueDepth: number;
    durationMs: number;
    phase: 'enqueue' | 'start' | 'complete' | 'error';
  }): void {
    this.onTelemetry?.(event);
  }
}
