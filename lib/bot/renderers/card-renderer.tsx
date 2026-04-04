/** @jsxImportSource chat */
import type { BotThread } from '@/lib/bot/types';
import { Actions, Button, Card, CardText } from 'chat';
import type { SelectionOption } from '../steps/step-types';

/**
 * Options for rendering a simple card.
 */
export interface CardOptions {
  title: string;
  content: string;
}

/**
 * Options for rendering a selection card with buttons.
 */
export interface SelectionCardOptions {
  title: string;
  content?: string;
  options: SelectionOption[];
}

/**
 * Render a simple card with text content.
 */
export async function renderCard(
  thread: BotThread,
  options: CardOptions
): Promise<void> {
  await thread.post(
    <Card title={options.title}>
      <CardText>{options.content}</CardText>
    </Card>
  );
}

/**
 * Render a selection card with button options.
 */
export async function renderSelectionCard(
  thread: BotThread,
  options: SelectionCardOptions
): Promise<void> {
  await thread.post(
    <Card title={options.title}>
      {options.content ? <CardText>{options.content}</CardText> : null}
      <Actions>
        {options.options.map((option) => (
          <Button
            key={option.value}
            id={`selection_${option.value}`}
            value={option.value}
          >
            {option.label}
          </Button>
        ))}
      </Actions>
    </Card>
  );
}
