import { stopPropagation } from '@blocksuite/affine-shared/utils';
import {
  BaseCellRenderer,
  createFromBaseCellRenderer,
  createIcon,
} from '@blocksuite/data-view';
import { css } from '@emotion/css';
import { html, type PropertyValues } from 'lit';
import { createRef, ref } from 'lit/directives/ref.js';

import {
  inlineLinkNodeStyle,
  linkCellStyle,
  linkContainerStyle,
  linkEditingStyle,
  normalTextStyle,
} from '../link/cell-renderer-css.js';
import {
  contactHref,
  emailPropertyModelConfig,
  phonePropertyModelConfig,
} from './define.js';

const valueStyle = css({
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
});

abstract class ContactCell extends BaseCellRenderer<string, string> {
  protected abstract readonly kind: 'email' | 'phone';

  private readonly _input = createRef<HTMLInputElement>();

  protected override firstUpdated(changed: PropertyValues) {
    super.firstUpdated(changed);
    this.classList.add(linkCellStyle);
  }

  private readonly _save = () => {
    const value = (this._input.value?.value ?? '').trim();
    if (value !== (this.value ?? '')) {
      this.valueSetNextTick(value);
    }
  };

  private readonly _onKeydown = (e: KeyboardEvent) => {
    if (e.key === 'Enter' && !e.isComposing) {
      this.selectCurrentCell(false);
    }
  };

  override afterEnterEditingMode() {
    const input = this._input.value;
    if (input) {
      input.focus();
      input.setSelectionRange(input.value.length, input.value.length);
    }
  }

  override beforeExitEditingMode() {
    this._save();
  }

  override render() {
    const value = this.value ?? '';
    if (this.isEditing$.value) {
      return html`<input
        class="${linkEditingStyle}"
        ${ref(this._input)}
        type=${this.kind === 'email' ? 'email' : 'tel'}
        .value=${value}
        @keydown=${this._onKeydown}
        @pointerdown=${stopPropagation}
      />`;
    }
    const href = contactHref(this.kind, value);
    return html`<div class="${linkContainerStyle}">
      ${
        href
          ? html`<a
              class="${inlineLinkNodeStyle} ${valueStyle}"
              href=${href}
              rel="noopener noreferrer"
              @click=${stopPropagation}
              >${value}</a
            >`
          : html`<span class="${normalTextStyle} ${valueStyle}">${value}</span>`
      }
    </div>`;
  }
}

export class EmailCell extends ContactCell {
  protected readonly kind = 'email';
}

export class PhoneCell extends ContactCell {
  protected readonly kind = 'phone';
}

export const emailColumnConfig = emailPropertyModelConfig.createPropertyMeta({
  icon: createIcon('EmailIcon'),
  cellRenderer: {
    view: createFromBaseCellRenderer(EmailCell),
  },
});

export const phoneColumnConfig = phonePropertyModelConfig.createPropertyMeta({
  icon: createIcon('PhonePanelIcon'),
  cellRenderer: {
    view: createFromBaseCellRenderer(PhoneCell),
  },
});
