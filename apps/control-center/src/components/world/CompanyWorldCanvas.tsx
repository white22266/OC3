'use client';

import type { Agent } from '@oc3/shared';
import { useEffect, useRef, useState } from 'react';
import { buildWorldModel } from './world-model';
import { loadDataUriImage } from './image-texture-loader';
import {
  APPROVED_WORLD_ART_SIZE,
  approvedWorldArtDataUri,
  approvedWorldHotspots,
} from './reference-art';

interface CompanyWorldCanvasProps {
  agents: Agent[];
  selectedAgentId: string;
  onSelectAgent: (agentId: string) => void;
}

type PixiModule = typeof import('pixi.js');
type HotspotId = keyof typeof approvedWorldHotspots;

const BASELINE_MARKERS: Record<HotspotId, string> = {
  yoda: 'WORK',
  bb8: 'WORK',
  aria: 'WORK',
  forge: 'Zzz',
  research: 'Zzz',
  ops: 'TOOL',
};

function drawSelection(PIXI: PixiModule, id: HotspotId, selected: boolean) {
  const hotspot = approvedWorldHotspots[id];
  const overlay = new PIXI.Container();
  overlay.position.set(hotspot.x, hotspot.y);

  const hit = new PIXI.Graphics();
  hit.roundRect(-hotspot.width / 2, -hotspot.height / 2, hotspot.width, hotspot.height, 12)
    .fill({ color: 0xffffff, alpha: 0.001 });
  overlay.addChild(hit);

  if (selected && id !== 'yoda') {
    const glow = new PIXI.Graphics();
    glow.roundRect(
      -hotspot.width / 2 + 6,
      -hotspot.height / 2 + 6,
      hotspot.width - 12,
      hotspot.height - 12,
      13,
    )
      .fill({ color: 0x44ffd4, alpha: 0.035 })
      .stroke({ color: 0x52f2d0, width: 3, alpha: 0.82 });
    glow.name = 'selection-glow';

    const arrow = new PIXI.Graphics();
    const arrowY = -hotspot.height / 2 - 7;
    arrow.moveTo(-10, arrowY).lineTo(10, arrowY).lineTo(0, arrowY + 13).closePath()
      .fill({ color: 0x52f2d0, alpha: 0.96 });
    overlay.addChild(glow, arrow);
  }

  return overlay;
}

function addInteractiveAgents(
  PIXI: PixiModule,
  stage: InstanceType<PixiModule['Container']>,
  agents: Agent[],
  selectedAgentId: string,
  onSelectAgent: (agentId: string) => void,
) {
  const world = buildWorldModel(agents, {});
  const models = new Map(world.agents.map((agent) => [agent.id, agent]));
  const selectionGlows: InstanceType<PixiModule['Graphics']>[] = [];

  for (const id of Object.keys(approvedWorldHotspots) as HotspotId[]) {
    const model = models.get(id);
    if (!model) continue;

    const overlay = drawSelection(PIXI, id, selectedAgentId === id);
    overlay.eventMode = 'static';
    overlay.cursor = 'pointer';
    overlay.on('pointertap', () => onSelectAgent(id));

    const hover = new PIXI.Graphics();
    const hotspot = approvedWorldHotspots[id];
    hover.roundRect(
      -hotspot.width / 2 + 8,
      -hotspot.height / 2 + 8,
      hotspot.width - 16,
      hotspot.height - 16,
      12,
    ).stroke({ color: 0x6fe8ff, width: 2, alpha: 0.45 });
    hover.alpha = 0;
    overlay.addChild(hover);
    overlay.on('pointerover', () => { hover.alpha = 1; });
    overlay.on('pointerout', () => { hover.alpha = 0; });

    const baselineMarker = BASELINE_MARKERS[id];
    if (model.marker !== baselineMarker) {
      const badge = new PIXI.Text({
        text: model.marker,
        style: {
          fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
          fontSize: 13,
          fontWeight: '800',
          fill: model.isSleeping ? 0xe9f6ff : 0x5ce8ff,
          stroke: { color: 0x06111f, width: 4 },
        },
      });
      badge.anchor.set(0.5);
      badge.position.set(0, -hotspot.height / 2 - 15);
      overlay.addChild(badge);
    }

    const glow = overlay.getChildByName('selection-glow');
    if (glow instanceof PIXI.Graphics) selectionGlows.push(glow);
    stage.addChild(overlay);
  }

  return selectionGlows;
}

export function CompanyWorldCanvas({ agents, selectedAgentId, onSelectAgent }: CompanyWorldCanvasProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    let disposed = false;
    let destroy: (() => void) | undefined;

    const mount = async () => {
      try {
        setStatus('loading');
        const PIXI = await import('pixi.js');
        if (disposed) return;

        const app = new PIXI.Application();
        await app.init({
          width: APPROVED_WORLD_ART_SIZE.width,
          height: APPROVED_WORLD_ART_SIZE.height,
          backgroundColor: 0x071322,
          antialias: false,
          resolution: 1,
        });
        if (disposed) {
          app.destroy(true);
          return;
        }

        // Do not send the very large data: URI through PixiJS Assets.load().
        // Chrome on the OC3 Mac successfully supports WebP, but Pixi's loader
        // was rejecting this inline source before the browser decoder got it.
        const image = await loadDataUriImage(approvedWorldArtDataUri);
        if (disposed) {
          app.destroy(true);
          return;
        }

        const texture = PIXI.Texture.from(image);
        texture.source.scaleMode = 'nearest';

        const art = new PIXI.Sprite(texture);
        art.position.set(0, 0);
        art.width = APPROVED_WORLD_ART_SIZE.width;
        art.height = APPROVED_WORLD_ART_SIZE.height;
        app.stage.addChild(art);

        const selectionGlows = addInteractiveAgents(
          PIXI,
          app.stage,
          agents,
          selectedAgentId,
          onSelectAgent,
        );

        let elapsed = 0;
        app.ticker.add((ticker) => {
          elapsed += ticker.deltaTime * 0.035;
          const pulse = 0.68 + Math.sin(elapsed) * 0.18;
          for (const glow of selectionGlows) glow.alpha = pulse;
        });

        const canvas = app.canvas;
        canvas.className = 'world-canvas';
        canvas.setAttribute('aria-hidden', 'true');
        host.replaceChildren(canvas);

        setStatus('ready');
        destroy = () => app.destroy(true, { children: true });
      } catch (error) {
        console.error('[OC3 Company World] approved art layer failed to initialize', error);
        if (!disposed) setStatus('error');
      }
    };

    void mount();
    return () => {
      disposed = true;
      destroy?.();
    };
  }, [agents, selectedAgentId, onSelectAgent]);

  return (
    <div className="world-stage-wrap">
      <div ref={hostRef} className="world-canvas-host" data-state={status} />
      {status === 'loading' ? <div className="world-loading">BOOTING COMPANY WORLD…</div> : null}
      {status === 'error' ? <div className="world-error">2D WORLD UNAVAILABLE · management panels remain usable.</div> : null}
      <div className="sr-only" aria-label="Agent selection controls">
        {agents.map((agent) => (
          <button key={agent.id} type="button" aria-label={`Select ${agent.name}`} onClick={() => onSelectAgent(agent.id)}>
            {agent.name}
          </button>
        ))}
      </div>
      <div className="world-hint">CLICK AN AGENT · THE APPROVED PIXEL WORLD IS THE VISUAL SOURCE OF TRUTH</div>
    </div>
  );
}
