import { Recipe, ShoppingListItem, MealPlanItem } from '../types';
import { db } from './db';
import { loadSettings } from './settingsService';

let papaModulePromise: Promise<typeof import('papaparse')> | null = null;
let jsPdfModulePromise: Promise<typeof import('jspdf')> | null = null;

const SAFE_TEXT_MIME_TYPES = new Set([
    'application/json',
    'application/json;charset=utf-8',
    'application/pdf',
    'text/calendar;charset=utf-8',
    'text/csv;charset=utf-8',
    'text/markdown;charset=utf-8',
    'text/plain;charset=utf-8',
]);

const getPapaModule = async () => {
    if (!papaModulePromise) {
        papaModulePromise = import('papaparse');
    }
    return papaModulePromise;
};

const getJsPdfCtor = async () => {
    if (!jsPdfModulePromise) {
        jsPdfModulePromise = import('jspdf');
    }
    const { jsPDF } = await jsPdfModulePromise;
    return jsPDF;
};

// Helper function to trigger download
const downloadFile = (filename: string, content: string | Blob, mimeType: string) => {
    const normalizedMimeType = SAFE_TEXT_MIME_TYPES.has(mimeType) ? mimeType : 'application/octet-stream';
    const blob = content instanceof Blob ? content : new Blob([content], { type: normalizedMimeType });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.rel = 'noopener noreferrer';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
};

// --- Recipe to Text Converters ---

const recipeToPlainText = (recipe: Recipe): string => {
    let text = `REZEPT: ${recipe.recipeTitle}\n`;
    text += "========================================\n\n";
    text += `${recipe.shortDescription}\n\n`;
    text += `DETAILS:\n- Gesamtzeit: ${recipe.totalTime}\n- Portionen: ${recipe.servings}\n- Schwierigkeit: ${recipe.difficulty}\n\n`;

    text += "ZUTATEN:\n";
    recipe.ingredients.forEach(group => {
        if (group.sectionTitle) {
            text += `\n--- ${group.sectionTitle} ---\n`;
        }
        group.items.forEach(item => {
            text += `- ${item.quantity || ''} ${item.unit || ''} ${item.name}\n`.trimStart();
        });
    });

    text += "\nANLEITUNG:\n";
    recipe.instructions.forEach((step, index) => {
        text += `${index + 1}. ${step}\n`;
    });

    if (recipe.expertTips && recipe.expertTips.length > 0) {
        text += "\nEXPERTENTIPPS:\n";
        recipe.expertTips.forEach(tip => {
            text += `- ${tip.title}: ${tip.content}\n`;
        });
    }

    return text;
};

const recipeToMarkdown = (recipe: Recipe): string => {
    let md = `# ${recipe.recipeTitle}\n\n`;
    md += `*${recipe.shortDescription}*\n\n`;
    md += `**Gesamtzeit:** ${recipe.totalTime} | **Portionen:** ${recipe.servings} | **Schwierigkeit:** ${recipe.difficulty}\n\n`;

    md += "## Zutaten\n";
    recipe.ingredients.forEach(group => {
        if (group.sectionTitle) {
            md += `### ${group.sectionTitle}\n`;
        }
        group.items.forEach(item => {
            md += `- ${item.quantity || ''} ${item.unit || ''} ${item.name}\n`.trimStart();
        });
    });

    md += "\n## Anleitung\n";
    recipe.instructions.forEach((step, index) => {
        md += `${index + 1}. ${step}\n`;
    });

    if (recipe.expertTips && recipe.expertTips.length > 0) {
        md += "\n## Expertentipps\n";
        recipe.expertTips.forEach(tip => {
            md += `**${tip.title}:** ${tip.content}\n`;
        });
    }

    return md;
};

// --- Single Recipe Export Functions ---

export const exportRecipeToJson = (recipe: Recipe) => {
    const filename = `${recipe.recipeTitle.replace(/\s/g, '_')}.json`;
    downloadFile(filename, JSON.stringify(recipe, null, 2), 'application/json');
};

export const exportRecipeToTxt = (recipe: Recipe) => {
    const filename = `${recipe.recipeTitle.replace(/\s/g, '_')}.txt`;
    downloadFile(filename, recipeToPlainText(recipe), 'text/plain;charset=utf-8');
};

export const exportRecipeToMarkdown = (recipe: Recipe) => {
    const filename = `${recipe.recipeTitle.replace(/\s/g, '_')}.md`;
    downloadFile(filename, recipeToMarkdown(recipe), 'text/markdown;charset=utf-8');
};

export const exportRecipeToCsv = async (recipe: Recipe) => {
    const data = recipe.ingredients.flatMap(group => 
        group.items.map(item => ({
            'Rezept': recipe.recipeTitle,
            'Gruppe': group.sectionTitle || '',
            'Menge': item.quantity,
            'Einheit': item.unit,
            'Zutat': item.name,
        }))
    );
    const Papa = await getPapaModule();
    const csv = Papa.unparse(data);
    const filename = `${recipe.recipeTitle.replace(/\s/g, '_')}_Zutaten.csv`;
    downloadFile(filename, csv, 'text/csv;charset=utf-8');
};

export const exportRecipeToPdf = async (recipe: Recipe) => {
    const JsPDF = await getJsPdfCtor();
    const doc = new JsPDF();
    const margin = 15;
    const pageWidth = doc.internal.pageSize.getWidth();
    let y = 20;

    const writeText = (text: string, size: number, style: 'normal' | 'bold' = 'normal') => {
        if (y > 280) {
            doc.addPage();
            y = 20;
        }
        doc.setFontSize(size);
        doc.setFont('helvetica', style);
        const splitText = doc.splitTextToSize(text, pageWidth - margin * 2);
        doc.text(splitText, margin, y);
        y += (splitText.length * (size * 0.35)) + 2; // Add line spacing
    };

    writeText(recipe.recipeTitle, 22, 'bold');
    y += 3;
    writeText(recipe.shortDescription, 11);
    y += 3;
    writeText(`Gesamtzeit: ${recipe.totalTime} | Portionen: ${recipe.servings}`, 11);
    y += 8;
    
    writeText("Zutaten", 16, 'bold');
    recipe.ingredients.forEach(group => {
        if (group.sectionTitle) {
            y+=2;
            writeText(group.sectionTitle, 12, 'bold');
        }
        group.items.forEach(item => {
            writeText(`- ${item.quantity || ''} ${item.unit || ''} ${item.name}`.trimStart(), 11);
        });
        y+=3;
    });

    y += 5;
    writeText("Anleitung", 16, 'bold');
    recipe.instructions.forEach((step, index) => {
        writeText(`${index + 1}. ${step}`, 11);
    });

    const filename = `${recipe.recipeTitle.replace(/\s/g, '_')}.pdf`;
    doc.save(filename);
};

// --- Shopping List Export ---

const getGroupedShoppingList = (list: ShoppingListItem[]) => {
    return list.reduce((acc, item) => {
        const category = item.category || 'Sonstiges';
        if (!acc[category]) acc[category] = [];
        acc[category].push(item);
        return acc;
    }, {} as Record<string, ShoppingListItem[]>);
};

const shoppingListToText = (list: ShoppingListItem[]): string => {
    let text = "EINKAUFSLISTE\n==================\n\n";
    const grouped = getGroupedShoppingList(list);
    Object.keys(grouped).sort().forEach(category => {
        text += `--- ${category} ---\n`;
        grouped[category].forEach(item => {
            text += `- ${item.quantity} ${item.unit} ${item.name}\n`;
        });
        text += '\n';
    });
    return text;
};

export const exportShoppingListToJson = (list: ShoppingListItem[]) => {
    downloadFile('einkaufsliste.json', JSON.stringify(list, null, 2), 'application/json');
};

export const exportShoppingListToTxt = (list: ShoppingListItem[]) => {
    downloadFile('einkaufsliste.txt', shoppingListToText(list), 'text/plain;charset=utf-8');
};

export const exportShoppingListToMarkdown = (list: ShoppingListItem[]) => {
    let md = "# Einkaufsliste\n\n";
    const grouped = getGroupedShoppingList(list);
    Object.keys(grouped).sort().forEach(category => {
        md += `## ${category}\n`;
        grouped[category].forEach(item => {
            md += `- [ ] ${item.quantity} ${item.unit} ${item.name}\n`;
        });
        md += '\n';
    });
    downloadFile('einkaufsliste.md', md, 'text/markdown;charset=utf-8');
};

export const exportShoppingListToCsv = async (list: ShoppingListItem[]) => {
    const data = list.map(item => ({
        Kategorie: item.category,
        Menge: item.quantity,
        Einheit: item.unit,
        Artikel: item.name,
        Erledigt: item.isChecked ? 'Ja' : 'Nein',
    }));
    const Papa = await getPapaModule();
    const csv = Papa.unparse(data);
    downloadFile('einkaufsliste.csv', csv, 'text/csv;charset=utf-8');
};

export const exportShoppingListToPdf = async (list: ShoppingListItem[]) => {
    const JsPDF = await getJsPdfCtor();
    const doc = new JsPDF();
    let y = 20;
    doc.setFontSize(22);
    doc.text("Einkaufsliste", 15, y);
    y += 10;
    
    const grouped = getGroupedShoppingList(list);
    Object.keys(grouped).sort().forEach(category => {
        if (y > 270) { doc.addPage(); y = 20; }
        y += 10;
        doc.setFontSize(16);
        doc.text(category, 15, y);
        y += 7;
        doc.setFontSize(12);
        grouped[category].forEach(item => {
            if (y > 280) { doc.addPage(); y = 20; }
            doc.text(`- ${item.quantity} ${item.unit} ${item.name}`, 20, y);
            y += 7;
        });
    });
    downloadFile('einkaufsliste.pdf', doc.output('blob'), 'application/pdf');
};

// --- Full Data Export ---

export const getFullData = async () => {
    const [pantry, recipes, mealPlan, shoppingList] = await Promise.all([
        db.pantry.toArray(),
        db.recipes.toArray(),
        db.mealPlan.toArray(),
        db.shoppingList.toArray()
    ]);
    const settings = loadSettings();
    return { pantry, recipes, mealPlan, shoppingList, settings, exportedAt: new Date().toISOString() };
};

export const exportFullDataAsJson = async (): Promise<boolean> => {
    try {
        const data = await getFullData();
        downloadFile('culinasync_backup.json', JSON.stringify(data, null, 2), 'application/json;charset=utf-8');
        return true;
    } catch (e) {
        console.error("JSON export failed", e);
        return false;
    }
};

export const exportFullDataAsTxt = async (): Promise<boolean> => {
    try {
        const data = await getFullData();
        let text = `CulinaSync Backup - ${new Date().toLocaleString('de-DE')}\n\n`;
        text += `=== REZEPTE (${data.recipes.length}) ===\n\n`;
        data.recipes.forEach(r => { text += recipeToPlainText(r) + "\n\n" });
        
        text += `=== EINKAUFSLISTE (${data.shoppingList.length}) ===\n\n`;
        text += shoppingListToText(data.shoppingList);

        downloadFile('culinasync_backup.txt', text, 'text/plain;charset=utf-8');
        return true;
    } catch { return false; }
};
export const exportFullDataAsMarkdown = async (): Promise<boolean> => {
    try {
        const data = await getFullData();
        let md = `# CulinaSync Backup - ${new Date().toLocaleString('de-DE')}\n\n`;
        md += `## Rezepte (${data.recipes.length})\n\n`;
        data.recipes.forEach(r => { md += recipeToMarkdown(r) + "\n\n---\n\n" });
        
        md += `## Einkaufsliste (${data.shoppingList.length})\n\n`;
        md += shoppingListToText(data.shoppingList).replace(/---/g, "###");

        downloadFile('culinasync_backup.md', md, 'text/markdown;charset=utf-8');
        return true;
    } catch { return false; }
};

export const exportFullDataAsCsv = async (): Promise<boolean> => {
    try {
        const data = await getFullData();
        const Papa = await getPapaModule();
        const pantryCsv = Papa.unparse(data.pantry);
        const recipesCsv = Papa.unparse(data.recipes.map(r => ({title: r.recipeTitle, servings: r.servings, difficulty: r.difficulty})));
        const shoppingCsv = Papa.unparse(data.shoppingList);
        
        const combined = `=== PANTRY ===\n${pantryCsv}\n\n=== RECIPES ===\n${recipesCsv}\n\n=== SHOPPING LIST ===\n${shoppingCsv}`;
        downloadFile('culinasync_backup.csv', combined, 'text/csv;charset=utf-8');
        return true;
    } catch { return false; }
};

export const exportFullDataAsPdf = async (): Promise<boolean> => {
     try {
    const JsPDF = await getJsPdfCtor();
    const doc = new JsPDF();
        const data = await getFullData();
        let y = 20;

        doc.setFontSize(22);
        doc.text(`CulinaSync Backup`, 15, y);
        doc.setFontSize(12);
        y += 7;
        doc.text(`${new Date(data.exportedAt).toLocaleString('de-DE')}`, 15, y);
        y += 15;

        doc.setFontSize(16);
        doc.text(`Zusammenfassung`, 15, y);
        y += 7;
        doc.setFontSize(12);
        doc.text(`- ${data.recipes.length} Rezepte`, 20, y);
        y += 7;
        doc.text(`- ${data.pantry.length} Artikel im Vorrat`, 20, y);
        y += 7;
        doc.text(`- ${data.mealPlan.length} geplante Mahlzeiten`, 20, y);
        y += 7;
        doc.text(`- ${data.shoppingList.length} Artikel auf der Einkaufsliste`, 20, y);
        y += 15;

        doc.text("Eine detaillierte PDF-Ausgabe aller Daten ist derzeit nicht verfügbar.", 15, y);
        doc.text("Bitte nutze den JSON-Export für ein vollständiges Backup.", 15, y + 7);

        downloadFile('culinasync_backup_summary.pdf', doc.output('blob'), 'application/pdf');
        return true;
    } catch(e) {
        console.error("PDF export failed", e);
        return false;
    }
};

const escapeIcsText = (value: string): string => {
    return value
        .replace(/\\/g, '\\\\')
        .replace(/;/g, '\\;')
        .replace(/,/g, '\\,')
        .replace(/\n/g, '\\n');
};

const toIcsDate = (date: string): string => date.replace(/-/g, '');

export const exportMealPlanWeekToIcs = (
    weekDates: Date[],
    mealsByDate: Record<string, MealPlanItem>,
    recipesById: Map<number, Recipe>
) => {
    const now = new Date();
    const nowUtc = now.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z');

    const lines: string[] = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//CulinaSync//Meal Planner//DE',
        'CALSCALE:GREGORIAN',
        'METHOD:PUBLISH',
    ];

    for (const date of weekDates) {
        const dateKey = date.toISOString().split('T')[0];
        const mealTypes: Array<'Frühstück' | 'Mittagessen' | 'Abendessen'> = ['Frühstück', 'Mittagessen', 'Abendessen'];

        for (const mealType of mealTypes) {
            const meal = mealsByDate[`${dateKey}-${mealType}`];
            if (!meal) continue;

            const recipe = meal.recipeId ? recipesById.get(meal.recipeId) : undefined;
            const summary = recipe
                ? `${mealType}: ${recipe.recipeTitle}`
                : `${mealType}: ${meal.note || 'Meal note'}`;

            const description = recipe
                ? `${recipe.shortDescription || ''}\\nPortionen: ${meal.servings || recipe.servings}`
                : meal.note || '';

            const startDate = toIcsDate(dateKey);
            const endDateDate = new Date(date);
            endDateDate.setDate(endDateDate.getDate() + 1);
            const endDate = toIcsDate(endDateDate.toISOString().split('T')[0]);

            const uidSeed = `${dateKey}-${mealType}-${meal.id || recipe?.id || 'note'}`;
            const uid = `${uidSeed}@culinasync.local`;

            lines.push('BEGIN:VEVENT');
            lines.push(`UID:${uid}`);
            lines.push(`DTSTAMP:${nowUtc}`);
            lines.push(`DTSTART;VALUE=DATE:${startDate}`);
            lines.push(`DTEND;VALUE=DATE:${endDate}`);
            lines.push(`SUMMARY:${escapeIcsText(summary)}`);
            lines.push(`DESCRIPTION:${escapeIcsText(description)}`);
            lines.push('END:VEVENT');
        }
    }

    lines.push('END:VCALENDAR');
    const content = `${lines.join('\r\n')}\r\n`;
    const from = weekDates[0]?.toISOString().split('T')[0] || 'week';
    const to = weekDates[6]?.toISOString().split('T')[0] || 'week';
    downloadFile(`mealplan_${from}_${to}.ics`, content, 'text/calendar;charset=utf-8');
};
