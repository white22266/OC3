'use client';

import type { Agent } from '@oc3/shared';
import { useEffect, useRef, useState } from 'react';
import { agentHomePositions, officeZones, WORLD_SIZE, type OfficeZone } from '../../data/office-layout';
import { buildWorldModel, type WorldAgentModel } from './world-model';

interface CompanyWorldCanvasProps {
  agents: Agent[];
  selectedAgentId: string;
  onSelectAgent: (agentId: string) => void;
}

type PixiModule = typeof import('pixi.js');
type ZonePalette = Record<OfficeZone['kind'], { fill: number; border: number }>;

const zonePalette: ZonePalette = {
  room: { fill: 0x18243a, border: 0x3d5d80 },
  desk: { fill: 0xd7c8aa, border: 0x806f59 },
  lounge: { fill: 0xb8b3a5, border: 0x61738a },
  lobby: { fill: 0xe0d6bd, border: 0x54708d },
};

const hairColors: Record<string, number> = {
  yoda: 0x20283a,
  bb8: 0xe16f2d,
  aria: 0xf07eaa,
  forge: 0x20283a,
  research: 0xe7ba55,
  ops: 0x204f7f,
};

function addText(PIXI: PixiModule, text: string, x: number, y: number, fontSize = 16, color = 0xdcecff) {
  const label = new PIXI.Text({
    text,
    style: {
      fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
      fontSize,
      fill: color,
      fontWeight: '700',
      letterSpacing: 1,
      align: 'center',
    },
  });
  label.anchor.set(0.5);
  label.position.set(x, y);
  return label;
}

function drawGrid(PIXI: PixiModule) {
  const floor = new PIXI.Graphics();
  floor.rect(0, 0, WORLD_SIZE.width, WORLD_SIZE.height).fill({ color: 0xc7c0ad });
  for (let x = 0; x <= WORLD_SIZE.width; x += 40) floor.moveTo(x, 0).lineTo(x, WORLD_SIZE.height);
  for (let y = 0; y <= WORLD_SIZE.height; y += 40) floor.moveTo(0, y).lineTo(WORLD_SIZE.width, y);
  floor.stroke({ color: 0x7f8b8f, width: 1, alpha: 0.14 });
  return floor;
}

function drawPlant(PIXI: PixiModule, x: number, y: number) {
  const plant = new PIXI.Container();
  plant.position.set(x, y);
  const pot = new PIXI.Graphics();
  pot.roundRect(-10, 4, 20, 17, 4).fill({ color: 0xb6783e }).stroke({ color: 0x704524, width: 2 });
  const leaves = new PIXI.Graphics();
  leaves.circle(-8, -5, 10).fill({ color: 0x4d9f55 });
  leaves.circle(7, -8, 11).fill({ color: 0x62b95f });
  leaves.circle(0, -16, 12).fill({ color: 0x3e8e4c });
  plant.addChild(pot, leaves);
  return plant;
}

function drawDesk(PIXI: PixiModule, x: number, y: number, width = 150) {
  const furniture = new PIXI.Container();
  const desk = new PIXI.Graphics();
  desk.roundRect(x - width / 2, y, width, 42, 8).fill({ color: 0x8b5c3c }).stroke({ color: 0x523625, width: 3 });
  desk.roundRect(x - 38, y - 35, 76, 40, 5).fill({ color: 0x152a42 }).stroke({ color: 0x66d3ff, width: 3 });
  desk.rect(x - 30, y - 28, 60, 24).fill({ color: 0x143e61 });
  desk.rect(x - 4, y + 42, 8, 18).fill({ color: 0x51382b });
  furniture.addChild(desk);
  return furniture;
}

function drawZoneDetails(PIXI: PixiModule, zone: OfficeZone) {
  const group = new PIXI.Container();

  if (zone.id === 'meeting-room') {
    const table = new PIXI.Graphics();
    table.roundRect(zone.x + 72, zone.y + 78, zone.width - 144, 82, 10).fill({ color: 0x9b6944 }).stroke({ color: 0x5e412e, width: 3 });
    group.addChild(table);
    for (const x of [zone.x + 92, zone.x + 175, zone.x + 258]) {
      const chair = new PIXI.Graphics();
      chair.roundRect(x - 18, zone.y + 52, 36, 30, 7).fill({ color: 0x2d5f9e }).stroke({ color: 0x173659, width: 2 });
      chair.roundRect(x - 18, zone.y + 158, 36, 30, 7).fill({ color: 0x2d5f9e }).stroke({ color: 0x173659, width: 2 });
      group.addChild(chair);
    }
    group.addChild(drawPlant(PIXI, zone.x + zone.width - 35, zone.y + zone.height - 30));
  }

  if (zone.id === 'lobby') {
    group.addChild(
      addText(PIXI, 'OC3', zone.x + zone.width / 2, zone.y + 95, 52, 0x243b5e),
      addText(PIXI, 'IDEAS  ·  AGENTS  ·  IMPACT', zone.x + zone.width / 2, zone.y + 140, 12, 0x37567a),
      drawPlant(PIXI, zone.x + 28, zone.y + zone.height - 34),
      drawPlant(PIXI, zone.x + zone.width - 28, zone.y + zone.height - 34),
    );
  }

  if (zone.id === 'ai-lab') {
    const wallScreen = new PIXI.Graphics();
    wallScreen.roundRect(zone.x + 120, zone.y + 56, 190, 78, 7).fill({ color: 0x073352 }).stroke({ color: 0x38d7ff, width: 4 });
    wallScreen.circle(zone.x + 215, zone.y + 95, 25).stroke({ color: 0x47e2ff, width: 3 });
    wallScreen.moveTo(zone.x + 190, zone.y + 95).lineTo(zone.x + 240, zone.y + 95).stroke({ color: 0x47e2ff, width: 2 });
    group.addChild(wallScreen, drawDesk(PIXI, zone.x + 120, zone.y + 154, 120), drawDesk(PIXI, zone.x + 305, zone.y + 154, 120));
  }

  if (zone.id === 'lounge') {
    const couch = new PIXI.Graphics();
    couch.roundRect(zone.x + 38, zone.y + 80, 190, 66, 14).fill({ color: 0x275a9a }).stroke({ color: 0x163961, width: 3 });
    couch.roundRect(zone.x + 58, zone.y + 146, 150, 32, 10).fill({ color: 0x2f68ae });
    const table = new PIXI.Graphics();
    table.roundRect(zone.x + 80, zone.y + 184, 110, 32, 8).fill({ color: 0x855839 }).stroke({ color: 0x533923, width: 2 });
    group.addChild(couch, table, drawPlant(PIXI, zone.x + zone.width - 42, zone.y + 84));
  }

  if (zone.id === 'servers') {
    for (let i = 0; i < 4; i += 1) {
      const rack = new PIXI.Graphics();
      const x = zone.x + 34 + i * 66;
      rack.roundRect(x, zone.y + 72, 52, 128, 5).fill({ color: 0x111b2b }).stroke({ color: 0x345473, width: 3 });
      for (let row = 0; row < 5; row += 1) rack.rect(x + 9, zone.y + 86 + row * 21, 34, 7).fill({ color: row % 2 ? 0x20e3a1 : 0x2ca8e9 });
      group.addChild(rack);
    }
  }

  if (zone.kind === 'desk' && ['yoda-desk', 'bb8-desk', 'aria-desk', 'shared-work'].includes(zone.id)) {
    if (zone.id === 'shared-work') group.addChild(drawDesk(PIXI, zone.x + 105, zone.y + 110, 160), drawDesk(PIXI, zone.x + 310, zone.y + 110, 160));
    else group.addChild(drawDesk(PIXI, zone.x + zone.width / 2, zone.y + 92, 170));
  }

  return group;
}

function drawZone(PIXI: PixiModule, zone: OfficeZone) {
  const palette = zonePalette[zone.kind];
  const group = new PIXI.Container();
  const shape = new PIXI.Graphics();
  shape.roundRect(zone.x, zone.y, zone.width, zone.height, 12).fill({ color: palette.fill }).stroke({ color: palette.border, width: 4 });
  const labelBox = new PIXI.Graphics();
  const labelWidth = Math.min(zone.width - 28, Math.max(142, zone.label.length * 10));
  labelBox.roundRect(zone.x + zone.width / 2 - labelWidth / 2, zone.y + 10, labelWidth, 30, 4).fill({ color: 0x101b2f, alpha: 0.96 }).stroke({ color: 0x4b759f, width: 2 });
  const label = addText(PIXI, zone.label, zone.x + zone.width / 2, zone.y + 25, 13, 0xdbeeff);
  group.addChild(shape, labelBox, label, drawZoneDetails(PIXI, zone));
  return group;
}

function drawChibiAgent(PIXI: PixiModule, agent: WorldAgentModel, selected: boolean, onSelect: () => void) {
  const group = new PIXI.Container();
  group.position.set(agent.position.x, agent.position.y);
  group.eventMode = 'static';
  group.cursor = 'pointer';
  group.on('pointertap', onSelect);

  if (selected) {
    const glow = new PIXI.Graphics();
    glow.roundRect(-50, -64, 100, 126, 18).fill({ color: 0x2fffd1, alpha: 0.13 }).stroke({ color: 0x4dffd6, width: 4, alpha: 0.92 });
    group.addChild(glow);
  }

  const shadow = new PIXI.Graphics();
  shadow.ellipse(0, 49, 31, 10).fill({ color: 0x0b1120, alpha: 0.28 });
  group.addChild(shadow);

  const body = new PIXI.Graphics();
  const bodyY = agent.isSleeping ? 18 : 8;
  body.roundRect(-23, bodyY, 46, 40, 12).fill({ color: 0x183f6d }).stroke({ color: 0x102840, width: 3 });
  body.roundRect(-17, bodyY + 26, 14, 25, 6).fill({ color: 0x142338 });
  body.roundRect(3, bodyY + 26, 14, 25, 6).fill({ color: 0x142338 });
  body.roundRect(-30, bodyY + 5, 12, 30, 6).fill({ color: 0xf1c0a4 });
  body.roundRect(18, bodyY + 5, 12, 30, 6).fill({ color: 0xf1c0a4 });
  group.addChild(body);

  const headY = agent.isSleeping ? 8 : -18;
  const face = new PIXI.Graphics();
  face.roundRect(-36, headY - 31, 72, 64, 18).fill({ color: 0xf4c8ad }).stroke({ color: 0x1a2230, width: 4 });
  const hair = hairColors[agent.id] ?? 0x3d4658;
  face.roundRect(-37, headY - 34, 74, 28, 16).fill({ color: hair });
  face.roundRect(-38, headY - 16, 14, 30, 8).fill({ color: hair });
  face.roundRect(24, headY - 16, 14, 30, 8).fill({ color: hair });
  if (agent.isSleeping) {
    face.moveTo(-20, headY + 5).lineTo(-8, headY + 5).stroke({ color: 0x202533, width: 3 });
    face.moveTo(8, headY + 5).lineTo(20, headY + 5).stroke({ color: 0x202533, width: 3 });
  } else {
    face.roundRect(-21, headY - 1, 9, 13, 3).fill({ color: 0x111827 });
    face.roundRect(12, headY - 1, 9, 13, 3).fill({ color: 0x111827 });
    face.rect(-15, headY + 20, 30, 3).fill({ color: 0xc56868 });
  }
  group.addChild(face);

  const nameBox = new PIXI.Graphics();
  nameBox.roundRect(-52, 60, 104, 31, 7).fill({ color: 0x10223a, alpha: 0.96 }).stroke({ color: selected ? 0x4dffd6 : 0x385f86, width: 2 });
  group.addChild(nameBox, addText(PIXI, agent.name, 0, 75, 14, 0xf3f8ff));

  if (agent.marker !== 'WORK') {
    const marker = addText(PIXI, agent.marker, 34, headY - 52, agent.isSleeping ? 21 : 15, agent.isSleeping ? 0xf0f6ff : 0x6ef5ff);
    marker.rotation = agent.isSleeping ? -0.08 : 0;
    group.addChild(marker);
  }
  return group;
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
        await app.init({ width: WORLD_SIZE.width, height: WORLD_SIZE.height, backgroundColor: 0x0a1424, antialias: false, resolution: 1 });
        if (disposed) { app.destroy(true); return; }

        const canvas = app.canvas;
        canvas.className = 'world-canvas';
        canvas.setAttribute('aria-hidden', 'true');
        host.replaceChildren(canvas);

        const border = new PIXI.Graphics();
        border.roundRect(8, 8, WORLD_SIZE.width - 16, WORLD_SIZE.height - 16, 16).fill({ color: 0x0b1628 }).stroke({ color: 0x3f8cc3, width: 4 });
        app.stage.addChild(drawGrid(PIXI), border);
        for (const zone of officeZones) app.stage.addChild(drawZone(PIXI, zone));

        const world = buildWorldModel(agents, agentHomePositions);
        const sleepers: { view: ReturnType<typeof drawChibiAgent>; baseY: number }[] = [];
        for (const agent of world.agents) {
          const view = drawChibiAgent(PIXI, agent, selectedAgentId === agent.id, () => onSelectAgent(agent.id));
          app.stage.addChild(view);
          if (agent.isSleeping) sleepers.push({ view, baseY: agent.position.y });
        }

        let elapsed = 0;
        app.ticker.add((ticker) => {
          elapsed += ticker.deltaTime * 0.045;
          for (const sleeper of sleepers) sleeper.view.y = sleeper.baseY + Math.sin(elapsed) * 1.5;
        });

        setStatus('ready');
        destroy = () => app.destroy(true, { children: true });
      } catch (error) {
        console.error('[OC3 Company World] PixiJS initialization failed', error);
        if (!disposed) setStatus('error');
      }
    };

    void mount();
    return () => { disposed = true; destroy?.(); };
  }, [agents, selectedAgentId, onSelectAgent]);

  return <div className="world-stage-wrap">
    <div ref={hostRef} className="world-canvas-host" data-state={status} />
    {status === 'loading' ? <div className="world-loading">BOOTING COMPANY WORLD…</div> : null}
    {status === 'error' ? <div className="world-error">2D WORLD UNAVAILABLE · management panels remain usable.</div> : null}
    <div className="sr-only" aria-label="Agent selection controls">{agents.map((agent) => <button key={agent.id} type="button" aria-label={`Select ${agent.name}`} onClick={() => onSelectAgent(agent.id)}>{agent.name}</button>)}</div>
    <div className="world-hint">CLICK AN AGENT · IDLE AGENTS SLEEP AT THEIR DESKS</div>
  </div>;
}
