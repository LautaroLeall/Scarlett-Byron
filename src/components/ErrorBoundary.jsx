import { Component } from 'react';
import { RotateCcw, Sparkles } from 'lucide-react';
import { WEDDING_DETAILS } from '../data/weddingData.js';

export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    return (
      <div className="min-h-dvh w-full bg-royal-950 text-ink flex items-center justify-center p-6">
        <div className="max-w-sm w-full bg-surface-container border border-outline rounded-2xl p-6 text-center shadow-lg flex flex-col items-center gap-4">
          <Sparkles className="w-7 h-7 text-primary" aria-hidden="true" />
          <h1 className="font-display text-[36px] leading-10 text-ink">
            {WEDDING_DETAILS.coupleNames}
          </h1>
          <p className="font-body text-[14px] leading-5.5 text-ink-muted">
            Ocurrió un inconveniente momentáneo al mostrar la invitación. Recarga la página para continuar.
          </p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="btn-gold min-h-11 inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-label text-[12px] tracking-[1px] font-semibold uppercase cursor-pointer"
          >
            <RotateCcw className="w-4 h-4 shrink-0" aria-hidden="true" />
            <span>Recargar invitación</span>
          </button>
        </div>
      </div>
    );
  }
}
