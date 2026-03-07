import type { Meta, StoryObj } from '@storybook/react';
import { ChefLoading } from './ChefLoading';

const meta = {
  title: 'AI Chef/ChefLoading',
  component: ChefLoading,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof ChefLoading>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};