'use client';

import type { Agent } from '@oc3/shared';
import { useEffect, useRef, useState } from 'react';
import { agentHomePositions, officeZones, WORLD_SIZE, type OfficeZone } from '../../data/office-layout';
import { agentCharacterProfiles, type AgentCharacterProfile } from './character-profiles';
import { officeArtDirection } from './office-art-direction';
import { buildWorldModel, type WorldAgentModel } from './world-model';

interface CompanyWorldCanvasProps {
  agents: Agent[];
  selectedAgentId: string;
  onSelectAgent: (agentId: string) => void;
}

type PixiModule = typeof import('pixi.js');
const P = officeArtDirection.palette;

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
      dropShadow: { color: 0x07101c, blur: 0, angle: Math.PI / 4, distance: 2, alpha: 0.74 },
    },
  });
  label.anchor.set(0.5);
  label.position.set(x, y);
  return label;
}

function zone(id: string): OfficeZone {
  const match = officeZones.find((item) => item.id === id);
  if (!match) throw new Error(`Missing office zone: ${id}`);
  return match;
}

function drawTileFloor(PIXI: PixiModule) {
  const group = new PIXI.Container();
  const floor = new PIXI.Graphics();
  floor.rect(0, 0, WORLD_SIZE.width, WORLD_SIZE.height).fill({ color: P.floorMid });
  const tile = 30;
  for (let y = 0; y < WORLD_SIZE.height; y += tile) {
    for (let x = 0; x < WORLD_SIZE.width; x += tile) {
      const alt = ((x / tile) + (y / tile)) % 2 === 0;
      floor.rect(x, y, tile, tile).fill({ color: alt ? P.floorLight : P.floorMid, alpha: 0.88 });
      floor.rect(x, y, tile, 2).fill({ color: 0xf0e6d1, alpha: 0.2 });
      floor.rect(x, y, 2, tile).fill({ color: P.floorDark, alpha: 0.26 });
      if ((x + y) % 90 === 0) floor.rect(x + 5, y + 6, 4, 4).fill({ color: 0xffffff, alpha: 0.06 });
    }
  }
  group.addChild(floor);

  const wall = new PIXI.Graphics();
  wall.roundRect(5, 5, WORLD_SIZE.width - 10, WORLD_SIZE.height - 10, 14).stroke({ color: P.wallOuter, width: 22 });
  wall.roundRect(16, 16, WORLD_SIZE.width - 32, WORLD_SIZE.height - 32, 10).stroke({ color: P.wallMid, width: 8 });
  wall.roundRect(25, 25, WORLD_SIZE.width - 50, WORLD_SIZE.height - 50, 8).stroke({ color: P.wallInner, width: 3 });
  group.addChild(wall);
  return group;
}

function drawWallLamp(PIXI: PixiModule, x: number, y: number) {
  const lamp = new PIXI.Container();
  const halo = new PIXI.Graphics();
  halo.circle(x, y + 4, 34).fill({ color: P.warm, alpha: 0.09 });
  halo.circle(x, y + 4, 20).fill({ color: P.warm, alpha: 0.11 });
  const g = new PIXI.Graphics();
  g.rect(x - 8, y - 10, 16, 20).fill({ color: 0xa86322 }).stroke({ color: 0x5f351a, width: 2 });
  g.rect(x - 5, y - 7, 10, 12).fill({ color: 0xffd57f });
  g.rect(x - 3, y - 5, 6, 7).fill({ color: 0xffefbb });
  lamp.addChild(halo, g);
  return lamp;
}

function drawPlant(PIXI: PixiModule, x: number, y: number, scale = 1, wide = false) {
  const plant = new PIXI.Container();
  plant.position.set(x, y);
  plant.scale.set(scale);
  const shadow = new PIXI.Graphics();
  shadow.ellipse(0, 19, wide ? 20 : 16, 6).fill({ color: 0x0a0f16, alpha: 0.2 });
  const pot = new PIXI.Graphics();
  pot.rect(-11, 3, 22, 16).fill({ color: 0xb66f36 }).stroke({ color: 0x6d3f22, width: 2 });
  pot.rect(-8, 19, 16, 5).fill({ color: 0x7a4729 });
  const leaves = new PIXI.Graphics();
  if (wide) {
    leaves.ellipse(-11, -8, 13, 8).fill({ color: 0x3f914c });
    leaves.ellipse(12, -7, 13, 8).fill({ color: 0x58ad59 });
    leaves.ellipse(-5, -18, 11, 14).fill({ color: 0x4ca052 });
    leaves.ellipse(8, -19, 11, 14).fill({ color: 0x67b963 });
  } else {
    leaves.circle(-8, -5, 10).fill({ color: 0x3f8f48 });
    leaves.circle(8, -9, 11).fill({ color: 0x5cb65f });
    leaves.circle(-1, -19, 12).fill({ color: 0x4aa454 });
  }
  leaves.rect(-3, -10, 6, 14).fill({ color: 0x2e753b });
  plant.addChild(shadow, pot, leaves);
  return plant;
}

function drawPaper(PIXI: PixiModule, x: number, y: number, rotation = 0) {
  const p = new PIXI.Graphics();
  p.position.set(x, y);
  p.rotation = rotation;
  p.rect(-12, -9, 24, 18).fill({ color: 0xf1e9d8 }).stroke({ color: 0xa99c82, width: 1 });
  p.rect(-7, -4, 14, 2).fill({ color: 0xaaa08f });
  p.rect(-7, 1, 11, 2).fill({ color: 0xbab09d });
  p.rect(-7, 6, 13, 1).fill({ color: 0xc0b5a2 });
  return p;
}

function drawMug(PIXI: PixiModule, x: number, y: number, color = 0xe7e1d4) {
  const mug = new PIXI.Graphics();
  mug.circle(x, y, 7).fill({ color }).stroke({ color: 0x756c62, width: 1 });
  mug.circle(x + 8, y, 4).stroke({ color: 0x756c62, width: 2 });
  mug.circle(x, y, 3).fill({ color: 0x724b34 });
  return mug;
}

function drawMonitor(PIXI: PixiModule, x: number, y: number, width = 68, glow = P.cyan) {
  const monitor = new PIXI.Container();
  const g = new PIXI.Graphics();
  g.roundRect(x - width / 2, y - 26, width, 42, 4).fill({ color: 0x0a1725 }).stroke({ color: 0x355a78, width: 3 });
  g.rect(x - width / 2 + 6, y - 19, width - 12, 27).fill({ color: 0x0b3857 });
  g.rect(x - width / 2 + 10, y - 15, width - 20, 3).fill({ color: glow, alpha: 0.9 });
  g.rect(x - width / 2 + 10, y - 8, Math.max(14, width - 36), 2).fill({ color: 0x68dfff, alpha: 0.5 });
  g.rect(x - 4, y + 16, 8, 12).fill({ color: 0x34485a });
  g.rect(x - 15, y + 28, 30, 4).fill({ color: 0x25384a });
  monitor.addChild(g);
  return monitor;
}

function drawDesk(PIXI: PixiModule, x: number, y: number, width = 170, accent = P.cyan, extraPlant = true) {
  const group = new PIXI.Container();
  const shadow = new PIXI.Graphics();
  shadow.roundRect(x - width / 2 + 5, y + 8, width, 56, 8).fill({ color: 0x090b0f, alpha: 0.2 });
  const g = new PIXI.Graphics();
  g.roundRect(x - width / 2, y, width, 49, 6).fill({ color: P.wood }).stroke({ color: 0x52331f, width: 3 });
  g.rect(x - width / 2 + 6, y + 6, width - 12, 5).fill({ color: P.woodLight, alpha: 0.72 });
  g.rect(x - width / 2 + 14, y + 49, 9, 20).fill({ color: 0x51331f });
  g.rect(x + width / 2 - 23, y + 49, 9, 20).fill({ color: 0x51331f });
  group.addChild(shadow, g, drawMonitor(PIXI, x + 4, y - 7, 70, accent), drawPaper(PIXI, x - width / 2 + 28, y + 20, -0.13), drawMug(PIXI, x + width / 2 - 27, y + 19));
  if (extraPlant) group.addChild(drawPlant(PIXI, x + width / 2 - 9, y - 14, 0.52));
  return group;
}

function drawChair(PIXI: PixiModule, x: number, y: number, facing: 'up' | 'down' = 'down') {
  const g = new PIXI.Graphics();
  const backY = facing === 'down' ? -13 : 9;
  g.roundRect(x - 20, y + backY, 40, 28, 4).fill({ color: 0x285c9d }).stroke({ color: 0x153453, width: 3 });
  g.rect(x - 15, y + (facing === 'down' ? 14 : -10), 30, 17).fill({ color: 0x214a7d }).stroke({ color: 0x153453, width: 2 });
  g.rect(x - 13, y + (facing === 'down' ? 31 : 7), 5, 11).fill({ color: 0x172d47 });
  g.rect(x + 8, y + (facing === 'down' ? 31 : 7), 5, 11).fill({ color: 0x172d47 });
  return g;
}

function drawBookcase(PIXI: PixiModule, x: number, y: number, width = 58, height = 116) {
  const g = new PIXI.Graphics();
  g.rect(x, y, width, height).fill({ color: 0x4e382c }).stroke({ color: 0x2d211b, width: 3 });
  for (let row = 0; row < 4; row += 1) {
    const yy = y + 12 + row * 25;
    g.rect(x + 7, yy, width - 14, 4).fill({ color: 0x2b231e });
    g.rect(x + 9, yy + 5, 7, 13).fill({ color: row % 2 ? 0xd5a641 : 0x377aa6 });
    g.rect(x + 18, yy + 4, 6, 14).fill({ color: 0x7cb1a2 });
    g.rect(x + 27, yy + 6, 8, 12).fill({ color: 0xc96755 });
    g.rect(x + 38, yy + 5, 7, 13).fill({ color: 0x557fc2 });
  }
  return g;
}

function drawPoster(PIXI: PixiModule, x: number, y: number, lines: string[], width = 74, height = 112) {
  const group = new PIXI.Container();
  const g = new PIXI.Graphics();
  g.rect(x, y, width, height).fill({ color: 0xf3ecd9 }).stroke({ color: 0x786c5c, width: 2 });
  g.rect(x + 5, y + 5, width - 10, 5).fill({ color: 0xd6cab1 });
  group.addChild(g);
  lines.forEach((line, index) => group.addChild(addText(PIXI, line, x + width / 2, y + 27 + index * 18, 10, 0x214f8a)));
  return group;
}

function drawRoomFrame(PIXI: PixiModule, room: OfficeZone, floorColor: number, rugColor?: number) {
  const group = new PIXI.Container();
  const shadow = new PIXI.Graphics();
  shadow.roundRect(room.x + 7, room.y + 9, room.width, room.height, 8).fill({ color: 0x000000, alpha: 0.19 });
  const shell = new PIXI.Graphics();
  shell.roundRect(room.x, room.y, room.width, room.height, 8).fill({ color: floorColor });
  shell.roundRect(room.x, room.y, room.width, room.height, 8).stroke({ color: P.wallOuter, width: 14 });
  shell.roundRect(room.x + 8, room.y + 8, room.width - 16, room.height - 16, 5).stroke({ color: P.wallMid, width: 6 });
  shell.rect(room.x + 13, room.y + 13, room.width - 26, 27).fill({ color: 0x101b2a });
  shell.rect(room.x + 17, room.y + 41, room.width - 34, 3).fill({ color: P.wallInner });
  group.addChild(shadow, shell);
  if (rugColor) {
    const rug = new PIXI.Graphics();
    rug.roundRect(room.x + 29, room.y + 58, room.width - 58, room.height - 80, 5).fill({ color: rugColor, alpha: 0.82 });
    rug.roundRect(room.x + 35, room.y + 64, room.width - 70, room.height - 92, 4).stroke({ color: 0x55708c, width: 2, alpha: 0.52 });
    group.addChild(rug);
  }
  return group;
}

function drawSign(PIXI: PixiModule, text: string, x: number, y: number, width: number) {
  const group = new PIXI.Container();
  const g = new PIXI.Graphics();
  g.roundRect(x - width / 2, y - 16, width, 32, 3).fill({ color: 0x0f1c2d }).stroke({ color: 0x5a7da0, width: 2 });
  g.rect(x - width / 2 + 5, y - 12, width - 10, 2).fill({ color: 0x244d72 });
  group.addChild(g, addText(PIXI, text, x, y, 13, 0xf1f6ff));
  return group;
}

function drawMeetingRoom(PIXI: PixiModule) {
  const room = zone('meeting-room');
  const group = drawRoomFrame(PIXI, room, 0x233550, 0x28496f);
  group.addChild(drawSign(PIXI, 'MEETING ROOM', room.x + room.width / 2, room.y + 29, 178));
  const table = new PIXI.Graphics();
  table.roundRect(room.x + 80, room.y + 92, room.width - 160, 91, 7).fill({ color: 0x98643f }).stroke({ color: 0x583824, width: 4 });
  table.rect(room.x + 88, room.y + 99, room.width - 176, 6).fill({ color: 0xc18252, alpha: 0.75 });
  group.addChild(table);
  [room.x + 104, room.x + 185, room.x + 266].forEach((x) => {
    group.addChild(drawChair(PIXI, x, room.y + 69, 'down'), drawChair(PIXI, x, room.y + 191, 'up'));
  });
  group.addChild(
    drawPaper(PIXI, room.x + 130, room.y + 128, -0.12),
    drawPaper(PIXI, room.x + 201, room.y + 147, 0.11),
    drawPaper(PIXI, room.x + 272, room.y + 123, -0.08),
    drawPlant(PIXI, room.x + room.width - 33, room.y + room.height - 30, 0.9, true),
    drawPlant(PIXI, room.x + 35, room.y + room.height - 32, 0.68),
    drawPoster(PIXI, room.x + 12, room.y + 58, ['PLAN', 'BUILD', 'SHIP', '♡']),
    drawBookcase(PIXI, room.x + room.width - 82, room.y + 53, 48, 83),
    drawWallLamp(PIXI, room.x + 52, room.y + 47),
    drawWallLamp(PIXI, room.x + room.width - 52, room.y + 47),
  );
  return group;
}

function drawLobby(PIXI: PixiModule) {
  const room = zone('lobby');
  const group = new PIXI.Container();
  const shadow = new PIXI.Graphics();
  shadow.roundRect(room.x + 5, room.y + 7, room.width, room.height, 7).fill({ color: 0x000000, alpha: 0.12 });
  const panel = new PIXI.Graphics();
  panel.roundRect(room.x, room.y, room.width, room.height, 7).fill({ color: 0xe0d4b9 }).stroke({ color: 0x7c7568, width: 4 });
  panel.rect(room.x + 7, room.y + 7, room.width - 14, 29).fill({ color: 0x132136 });
  panel.rect(room.x + 15, room.y + 45, room.width - 30, 4).fill({ color: 0xf1e8d1, alpha: 0.55 });
  group.addChild(shadow, panel, drawSign(PIXI, 'OC3  ·  IDEAS  ·  AGENTS  ·  IMPACT', room.x + room.width / 2, room.y + 25, room.width - 24));
  group.addChild(addText(PIXI, 'OC3', room.x + room.width / 2, room.y + 89, 56, 0x263e63));
  group.addChild(addText(PIXI, 'IDEAS', room.x + room.width / 2, room.y + 130, 12, 0x36577c));
  group.addChild(addText(PIXI, 'AGENTS', room.x + room.width / 2, room.y + 149, 12, 0x36577c));
  group.addChild(addText(PIXI, 'IMPACT', room.x + room.width / 2, room.y + 168, 12, 0x36577c));
  group.addChild(drawPlant(PIXI, room.x + 36, room.y + room.height - 27, 0.93, true), drawPlant(PIXI, room.x + room.width - 36, room.y + room.height - 27, 0.93, true));
  group.addChild(drawWallLamp(PIXI, room.x + 58, room.y + 48), drawWallLamp(PIXI, room.x + room.width - 58, room.y + 48));
  return group;
}

function drawRobot(PIXI: PixiModule, x: number, y: number) {
  const group = new PIXI.Container();
  const shadow = new PIXI.Graphics();
  shadow.ellipse(x, y + 46, 25, 8).fill({ color: 0x000000, alpha: 0.2 });
  const g = new PIXI.Graphics();
  g.roundRect(x - 23, y - 28, 46, 43, 13).fill({ color: 0xe6edf4 }).stroke({ color: 0x9aaab9, width: 3 });
  g.roundRect(x - 17, y - 18, 34, 19, 7).fill({ color: 0x142942 });
  g.circle(x, y - 9, 5).fill({ color: 0x53dcff });
  g.roundRect(x - 17, y + 14, 34, 31, 8).fill({ color: 0xd6e0ea }).stroke({ color: 0x9aaab9, width: 3 });
  g.rect(x - 27, y + 21, 10, 18).fill({ color: 0xc4d0dc });
  g.rect(x + 17, y + 21, 10, 18).fill({ color: 0xc4d0dc });
  group.addChild(shadow, g);
  return group;
}

function drawAiLab(PIXI: PixiModule) {
  const room = zone('ai-lab');
  const group = drawRoomFrame(PIXI, room, 0x1d3047, 0x213f61);
  group.addChild(drawSign(PIXI, 'AI LAB / MODELS', room.x + room.width / 2, room.y + 29, 183));
  const screen = new PIXI.Graphics();
  screen.roundRect(room.x + 143, room.y + 59, 194, 88, 4).fill({ color: 0x06324e }).stroke({ color: 0x39dfff, width: 4 });
  screen.rect(room.x + 152, room.y + 68, 176, 70).fill({ color: 0x0a4768, alpha: 0.72 });
  screen.circle(room.x + 240, room.y + 103, 29).stroke({ color: 0x5cecff, width: 3 });
  screen.moveTo(room.x + 240, room.y + 74).lineTo(room.x + 240, room.y + 132).stroke({ color: 0x5cecff, width: 2 });
  screen.moveTo(room.x + 211, room.y + 103).lineTo(room.x + 269, room.y + 103).stroke({ color: 0x5cecff, width: 2 });
  for (let i = 0; i < 5; i += 1) screen.rect(room.x + 164 + i * 22, room.y + 76 + (i % 2) * 8, 14, 3).fill({ color: 0x69e9ff, alpha: 0.68 });
  group.addChild(screen);
  group.addChild(drawBookcase(PIXI, room.x + 58, room.y + 56, 60, 118));
  group.addChild(drawRobot(PIXI, room.x + 112, room.y + 190));
  group.addChild(drawDesk(PIXI, room.x + 326, room.y + 181, 138, P.cyan));
  group.addChild(drawPoster(PIXI, room.x + room.width - 84, room.y + 56, ['BETTER', 'MODELS', 'A KINDER', 'WORLD']));
  group.addChild(drawPlant(PIXI, room.x + 130, room.y + 60, 0.74), drawPlant(PIXI, room.x + room.width - 38, room.y + room.height - 30, 0.8));
  group.addChild(drawWallLamp(PIXI, room.x + 37, room.y + 47), drawWallLamp(PIXI, room.x + room.width - 37, room.y + 47));
  return group;
}

function drawLounge(PIXI: PixiModule) {
  const room = zone('lounge');
  const group = new PIXI.Container();
  const rug = new PIXI.Graphics();
  rug.roundRect(room.x + 24, room.y + 66, room.width - 48, room.height - 80, 6).fill({ color: 0x264c78, alpha: 0.82 });
  rug.roundRect(room.x + 31, room.y + 73, room.width - 62, room.height - 94, 4).stroke({ color: 0x4f7196, width: 2, alpha: 0.55 });
  group.addChild(rug, drawSign(PIXI, 'LOUNGE', room.x + room.width / 2, room.y + 25, 142));
  const couch = new PIXI.Graphics();
  couch.roundRect(room.x + 36, room.y + 82, 196, 63, 10).fill({ color: 0x285999 }).stroke({ color: 0x15375d, width: 4 });
  couch.roundRect(room.x + 52, room.y + 135, 164, 38, 7).fill({ color: 0x346aad }).stroke({ color: 0x15375d, width: 3 });
  couch.rect(room.x + 45, room.y + 92, 11, 44).fill({ color: 0x22487a });
  couch.rect(room.x + 213, room.y + 92, 11, 44).fill({ color: 0x22487a });
  const table = new PIXI.Graphics();
  table.roundRect(room.x + 84, room.y + 182, 112, 37, 6).fill({ color: 0x835638 }).stroke({ color: 0x513622, width: 3 });
  group.addChild(couch, table, drawPaper(PIXI, room.x + 118, room.y + 200, -0.08), drawMug(PIXI, room.x + 171, room.y + 200));
  const cooler = new PIXI.Graphics();
  cooler.rect(room.x + 246, room.y + 149, 34, 61).fill({ color: 0xe5ebef }).stroke({ color: 0x778895, width: 2 });
  cooler.roundRect(room.x + 250, room.y + 117, 26, 38, 10).fill({ color: 0x80dbff, alpha: 0.76 }).stroke({ color: 0x4f91ab, width: 2 });
  group.addChild(cooler, drawPoster(PIXI, room.x + 7, room.y + 94, ['A', 'BRIGHTER', 'TOMORROW', 'TOGETHER']), drawPlant(PIXI, room.x + room.width - 30, room.y + 84, 0.84, true));
  group.addChild(drawBookcase(PIXI, room.x + 32, room.y + 36, 48, 64));
  return group;
}

function drawServerRoom(PIXI: PixiModule) {
  const room = zone('servers');
  const group = drawRoomFrame(PIXI, room, 0x14243a, 0x173150);
  group.addChild(drawSign(PIXI, 'SERVERS / LOGS', room.x + room.width / 2, room.y + 28, 180));
  for (let i = 0; i < 4; i += 1) {
    const x = room.x + 35 + i * 67;
    const rack = new PIXI.Graphics();
    rack.roundRect(x, room.y + 69, 53, 135, 4).fill({ color: 0x0d1828 }).stroke({ color: 0x36536f, width: 3 });
    rack.rect(x + 7, room.y + 79, 39, 7).fill({ color: 0x20354b });
    for (let row = 0; row < 5; row += 1) {
      rack.rect(x + 9, room.y + 94 + row * 20, 35, 6).fill({ color: row % 2 ? P.green : 0x32a9e8 });
      rack.circle(x + 13, room.y + 97 + row * 20, 2).fill({ color: 0xd1fff0 });
    }
    group.addChild(rack);
  }
  const terminal = new PIXI.Graphics();
  terminal.roundRect(room.x + 226, room.y + 194, 97, 56, 5).fill({ color: 0x07180f }).stroke({ color: 0x2d8556, width: 3 });
  for (let row = 0; row < 5; row += 1) terminal.rect(room.x + 238, room.y + 205 + row * 8, 58 - row * 6, 3).fill({ color: 0x39ef8b });
  const crates = new PIXI.Graphics();
  crates.rect(room.x + room.width - 71, room.y + 187, 45, 45).fill({ color: 0xa56f41 }).stroke({ color: 0x5f3e24, width: 3 });
  crates.moveTo(room.x + room.width - 66, room.y + 192).lineTo(room.x + room.width - 31, room.y + 227).stroke({ color: 0x6e4829, width: 2 });
  crates.moveTo(room.x + room.width - 31, room.y + 192).lineTo(room.x + room.width - 66, room.y + 227).stroke({ color: 0x6e4829, width: 2 });
  group.addChild(terminal, crates, drawPoster(PIXI, room.x + room.width - 79, room.y + 62, ['LOGS', 'KEEP', 'US', 'HONEST']), drawPlant(PIXI, room.x + room.width - 30, room.y + 53, 0.72));
  group.addChild(drawWallLamp(PIXI, room.x + 28, room.y + 49), drawWallLamp(PIXI, room.x + room.width - 28, room.y + 49));
  return group;
}

function drawOpenOffice(PIXI: PixiModule) {
  const group = new PIXI.Container();
  const aisle = new PIXI.Graphics();
  aisle.roundRect(394, 226, 392, 284, 6).fill({ color: 0xddd1b7, alpha: 0.64 });
  aisle.rect(405, 239, 370, 2).fill({ color: 0xf2e8d0, alpha: 0.55 });
  group.addChild(aisle);

  const plantPositions: Array<[number, number, number, boolean?]> = [
    [405, 268, 0.88, true], [785, 267, 0.88, true], [1110, 293, 0.78], [65, 292, 0.78],
    [340, 340, 0.64], [500, 343, 0.64], [650, 340, 0.64], [960, 340, 0.64],
    [340, 625, 0.68], [795, 626, 0.68], [375, 711, 0.76], [801, 711, 0.76],
  ];
  plantPositions.forEach(([x, y, scale, wide]) => group.addChild(drawPlant(PIXI, x, y, scale, Boolean(wide))));

  const desks = [
    { x: 264, y: 378, label: 'Yoda', role: 'Lead Agent' },
    { x: 572, y: 378, label: 'BB8', role: 'Messenger' },
    { x: 880, y: 378, label: 'Aria', role: 'Approval' },
  ];
  desks.forEach((desk) => {
    group.addChild(drawDesk(PIXI, desk.x, desk.y, 176));
    const plate = new PIXI.Graphics();
    plate.roundRect(desk.x - 59, desk.y + 52, 118, 36, 4).fill({ color: 0x102542 }).stroke({ color: 0x3e6f9c, width: 2 });
    group.addChild(plate, addText(PIXI, desk.label, desk.x, desk.y + 65, 14, 0xf4f8ff), addText(PIXI, desk.role, desk.x, desk.y + 80, 9, 0x8fbfe8));
  });

  group.addChild(drawDesk(PIXI, 470, 612, 164, 0x47cef8), drawDesk(PIXI, 680, 612, 164, 0x47cef8));
  const rug = new PIXI.Graphics();
  rug.roundRect(421, 686, 352, 60, 6).fill({ color: P.rug }).stroke({ color: 0x426ca1, width: 3 });
  rug.rect(433, 698, 328, 37).stroke({ color: 0x6686af, width: 2, alpha: 0.5 });
  group.addChild(rug, addText(PIXI, 'OC3', 597, 709, 31, 0xc7daf1), addText(PIXI, 'PEOPLE × AGENTS × IMPACT', 597, 735, 10, 0xa9c3df));
  return group;
}

function drawOfficeBackdrop(PIXI: PixiModule) {
  const group = new PIXI.Container();
  group.addChild(drawTileFloor(PIXI));
  group.addChild(drawMeetingRoom(PIXI), drawLobby(PIXI), drawAiLab(PIXI), drawOpenOffice(PIXI), drawLounge(PIXI), drawServerRoom(PIXI));
  const corridor = new PIXI.Graphics();
  corridor.rect(392, 247, 7, 30).fill({ color: 0xa35e20 }).stroke({ color: 0x70401f, width: 2 });
  corridor.rect(394, 252, 3, 16).fill({ color: 0xffd57e });
  corridor.rect(718, 247, 7, 30).fill({ color: 0xa35e20 }).stroke({ color: 0x70401f, width: 2 });
  corridor.rect(720, 252, 3, 16).fill({ color: 0xffd57e });
  group.addChild(corridor);
  [230, 580, 870, 1140].forEach((x) => group.addChild(drawWallLamp(PIXI, x, 23)));
  return group;
}

function drawHairBack(PIXI: PixiModule, profile: AgentCharacterProfile, headY: number) {
  const g = new PIXI.Graphics();
  if (profile.hairStyle === 'high-ponytail') {
    g.circle(28, headY - 27, 13).fill({ color: profile.hairShadow });
    g.circle(34, headY - 35, 9).fill({ color: profile.hair });
    g.rect(25, headY - 18, 15, 25).fill({ color: profile.hairShadow });
  }
  if (profile.hairStyle === 'shaggy-back') {
    g.moveTo(-28, headY - 20).lineTo(-37, headY - 3).lineTo(-29, headY + 14).lineTo(-17, headY + 5).lineTo(-8, headY + 18).lineTo(5, headY + 7).lineTo(18, headY + 17).lineTo(29, headY + 6).lineTo(34, headY - 9).lineTo(25, headY - 22).closePath().fill({ color: profile.hairShadow });
  }
  return g;
}

function drawHairFront(PIXI: PixiModule, profile: AgentCharacterProfile, headY: number) {
  const g = new PIXI.Graphics();
  const h = profile.hair;
  const s = profile.hairShadow;
  const hi = profile.hairHighlight;

  switch (profile.hairStyle) {
    case 'layered-messy':
      g.moveTo(-29, headY - 20).lineTo(-23, headY - 32).lineTo(-13, headY - 27).lineTo(-5, headY - 38).lineTo(4, headY - 29).lineTo(15, headY - 36).lineTo(23, headY - 25).lineTo(31, headY - 18).lineTo(27, headY - 4).lineTo(17, headY - 8).lineTo(12, headY + 2).lineTo(3, headY - 6).lineTo(-4, headY + 3).lineTo(-13, headY - 6).lineTo(-20, headY + 1).lineTo(-30, headY - 7).closePath().fill({ color: h });
      g.rect(-24, headY - 25, 12, 5).fill({ color: hi, alpha: 0.75 });
      g.rect(2, headY - 28, 13, 5).fill({ color: hi, alpha: 0.58 });
      break;
    case 'soft-spiky':
      g.moveTo(-29, headY - 18).lineTo(-24, headY - 30).lineTo(-13, headY - 25).lineTo(-7, headY - 38).lineTo(1, headY - 29).lineTo(10, headY - 39).lineTo(16, headY - 27).lineTo(27, headY - 32).lineTo(31, headY - 17).lineTo(27, headY - 2).lineTo(17, headY - 7).lineTo(11, headY + 2).lineTo(3, headY - 5).lineTo(-5, headY + 1).lineTo(-14, headY - 7).lineTo(-22, headY).lineTo(-30, headY - 6).closePath().fill({ color: h });
      g.rect(-18, headY - 27, 12, 5).fill({ color: hi, alpha: 0.74 });
      g.rect(7, headY - 31, 10, 5).fill({ color: hi, alpha: 0.6 });
      break;
    case 'high-ponytail':
      g.moveTo(-28, headY - 18).lineTo(-22, headY - 30).lineTo(-9, headY - 34).lineTo(5, headY - 32).lineTo(18, headY - 27).lineTo(27, headY - 17).lineTo(25, headY - 2).lineTo(17, headY - 6).lineTo(11, headY + 2).lineTo(3, headY - 5).lineTo(-6, headY + 1).lineTo(-13, headY - 6).lineTo(-22, headY).lineTo(-29, headY - 7).closePath().fill({ color: h });
      g.rect(-16, headY - 28, 15, 5).fill({ color: hi, alpha: 0.7 });
      g.circle(28, headY - 31, 5).fill({ color: profile.accent });
      break;
    case 'sleepy-undercut':
      g.moveTo(-28, headY - 17).lineTo(-20, headY - 29).lineTo(-4, headY - 33).lineTo(13, headY - 28).lineTo(27, headY - 17).lineTo(24, headY - 7).lineTo(12, headY - 2).lineTo(1, headY - 6).lineTo(-10, headY + 1).lineTo(-22, headY - 2).lineTo(-30, headY - 8).closePath().fill({ color: h });
      g.rect(-24, headY - 18, 10, 14).fill({ color: s });
      g.rect(6, headY - 27, 12, 4).fill({ color: hi, alpha: 0.55 });
      break;
    case 'side-swept-bob':
      g.moveTo(-29, headY - 19).lineTo(-22, headY - 31).lineTo(-8, headY - 35).lineTo(8, headY - 31).lineTo(22, headY - 25).lineTo(29, headY - 13).lineTo(28, headY + 7).lineTo(18, headY + 14).lineTo(12, headY - 2).lineTo(0, headY + 4).lineTo(-12, headY - 2).lineTo(-18, headY + 14).lineTo(-28, headY + 6).closePath().fill({ color: h });
      g.moveTo(-22, headY - 27).lineTo(12, headY - 31).lineTo(-4, headY - 8).lineTo(-17, headY - 4).closePath().fill({ color: hi, alpha: 0.45 });
      break;
    case 'shaggy-back':
      g.moveTo(-28, headY - 20).lineTo(-20, headY - 31).lineTo(-8, headY - 36).lineTo(4, headY - 31).lineTo(15, headY - 36).lineTo(26, headY - 24).lineTo(30, headY - 11).lineTo(25, headY + 2).lineTo(15, headY - 4).lineTo(7, headY + 4).lineTo(-3, headY - 4).lineTo(-12, headY + 4).lineTo(-21, headY - 3).lineTo(-29, headY - 8).closePath().fill({ color: h });
      g.rect(-16, headY - 29, 13, 5).fill({ color: hi, alpha: 0.62 });
      break;
  }
  return g;
}

function drawCharacterBody(PIXI: PixiModule, profile: AgentCharacterProfile, sleeping: boolean) {
  const group = new PIXI.Container();
  const bodyY = sleeping ? 14 : 8;
  const shadow = new PIXI.Graphics();
  shadow.ellipse(0, sleeping ? 41 : 50, sleeping ? 27 : 24, 7).fill({ color: 0x07101b, alpha: 0.25 });
  group.addChild(shadow);

  const legs = new PIXI.Graphics();
  legs.roundRect(-13, bodyY + 28, 10, sleeping ? 16 : 25, 3).fill({ color: profile.trouser });
  legs.roundRect(3, bodyY + 28, 10, sleeping ? 16 : 25, 3).fill({ color: profile.trouser });
  legs.rect(-14, bodyY + (sleeping ? 42 : 50), 12, 5).fill({ color: profile.shoe });
  legs.rect(2, bodyY + (sleeping ? 42 : 50), 12, 5).fill({ color: profile.shoe });
  group.addChild(legs);

  const torso = new PIXI.Graphics();
  torso.moveTo(-18, bodyY + 3).lineTo(-13, bodyY - 2).lineTo(13, bodyY - 2).lineTo(18, bodyY + 3).lineTo(16, bodyY + 31).lineTo(-16, bodyY + 31).closePath().fill({ color: profile.jacket }).stroke({ color: 0x102137, width: 2 });
  torso.rect(-8, bodyY + 1, 16, 24).fill({ color: profile.shirt });
  torso.rect(-2, bodyY + 4, 4, 17).fill({ color: profile.accent });
  torso.roundRect(-25, bodyY + 5, 9, sleeping ? 17 : 25, 4).fill({ color: profile.skin }).stroke({ color: 0xa06e5a, width: 1 });
  torso.roundRect(16, bodyY + 5, 9, sleeping ? 17 : 25, 4).fill({ color: profile.skin }).stroke({ color: 0xa06e5a, width: 1 });
  if (profile.outfit === 'messenger-hoodie') torso.rect(-18, bodyY, 36, 8).fill({ color: profile.jacket, alpha: 0.96 });
  if (profile.outfit === 'approval-cardigan') {
    torso.rect(-15, bodyY + 7, 4, 20).fill({ color: profile.hairHighlight, alpha: 0.6 });
    torso.rect(11, bodyY + 7, 4, 20).fill({ color: profile.hairHighlight, alpha: 0.6 });
  }
  if (profile.accessory === 'utility-belt') torso.rect(-15, bodyY + 24, 30, 4).fill({ color: 0x17324b });
  group.addChild(torso);
  return group;
}

function drawCharacterFace(PIXI: PixiModule, profile: AgentCharacterProfile, sleeping: boolean, headY: number) {
  const group = new PIXI.Container();
  group.addChild(drawHairBack(PIXI, profile, headY));
  const face = new PIXI.Graphics();
  face.roundRect(-25, headY - 20, 50, 43, 12).fill({ color: profile.skin }).stroke({ color: 0x1b2230, width: 3 });
  face.rect(-21, headY + 14, 42, 4).fill({ color: 0xe8aa91, alpha: 0.38 });
  group.addChild(face, drawHairFront(PIXI, profile, headY));

  const details = new PIXI.Graphics();
  if (sleeping) {
    details.moveTo(-14, headY + 4).lineTo(-5, headY + 4).stroke({ color: 0x202533, width: 2 });
    details.moveTo(5, headY + 4).lineTo(14, headY + 4).stroke({ color: 0x202533, width: 2 });
    details.moveTo(-3, headY + 15).lineTo(4, headY + 15).stroke({ color: 0xb76369, width: 2 });
  } else {
    details.roundRect(-15, headY, 6, 10, 2).fill({ color: 0x111827 });
    details.roundRect(9, headY, 6, 10, 2).fill({ color: 0x111827 });
    details.rect(-13, headY + 1, 2, 3).fill({ color: 0xffffff, alpha: 0.9 });
    details.rect(11, headY + 1, 2, 3).fill({ color: 0xffffff, alpha: 0.9 });
    details.rect(-5, headY + 15, 10, 2).fill({ color: 0xc15f68 });
    details.rect(-20, headY + 11, 6, 2).fill({ color: profile.blush, alpha: 0.58 });
    details.rect(14, headY + 11, 6, 2).fill({ color: profile.blush, alpha: 0.58 });
  }
  if (profile.accessory === 'glasses' && !sleeping) {
    details.roundRect(-19, headY - 2, 12, 12, 3).stroke({ color: 0x5f4a37, width: 2 });
    details.roundRect(7, headY - 2, 12, 12, 3).stroke({ color: 0x5f4a37, width: 2 });
    details.moveTo(-7, headY + 3).lineTo(7, headY + 3).stroke({ color: 0x5f4a37, width: 2 });
  }
  if (profile.accessory === 'earpiece') details.circle(24, headY + 2, 3).fill({ color: 0x49dcff });
  group.addChild(details);
  return group;
}

function drawPixelAgent(PIXI: PixiModule, agent: WorldAgentModel, selected: boolean, onSelect: () => void) {
  const profile = agentCharacterProfiles[agent.id] ?? agentCharacterProfiles.yoda;
  const group = new PIXI.Container();
  group.position.set(agent.position.x, agent.position.y);
  group.eventMode = 'static';
  group.cursor = 'pointer';
  group.on('pointertap', onSelect);

  if (selected) {
    const glow = new PIXI.Graphics();
    glow.roundRect(-43, -62, 86, 112, 14).fill({ color: 0x2fffd1, alpha: 0.08 }).stroke({ color: 0x4dffd6, width: 3, alpha: 0.92 });
    group.addChild(glow);
  }

  group.addChild(drawCharacterBody(PIXI, profile, agent.isSleeping));
  const headY = agent.isSleeping ? 7 : -14;
  group.addChild(drawCharacterFace(PIXI, profile, agent.isSleeping, headY));

  if (agent.id === 'yoda' && !agent.isSleeping) {
    const marker = new PIXI.Graphics();
    marker.moveTo(-8, -59).lineTo(8, -59).lineTo(0, -49).closePath().fill({ color: selected ? P.green : P.cyan });
    group.addChild(marker);
  }

  if (agent.marker !== 'WORK') {
    const marker = addText(PIXI, agent.marker, 30, headY - 42, agent.isSleeping ? 20 : 13, agent.isSleeping ? 0xeaf6ff : 0x6beaff);
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
        await app.init({ width: WORLD_SIZE.width, height: WORLD_SIZE.height, backgroundColor: 0x091422, antialias: false, resolution: 1 });
        if (disposed) { app.destroy(true); return; }

        const canvas = app.canvas;
        canvas.className = 'world-canvas';
        canvas.setAttribute('aria-hidden', 'true');
        host.replaceChildren(canvas);

        app.stage.addChild(drawOfficeBackdrop(PIXI));

        const world = buildWorldModel(agents, agentHomePositions);
        const sleepers: { view: ReturnType<typeof drawPixelAgent>; baseY: number }[] = [];
        for (const agent of world.agents) {
          const view = drawPixelAgent(PIXI, agent, selectedAgentId === agent.id, () => onSelectAgent(agent.id));
          app.stage.addChild(view);
          if (agent.isSleeping) sleepers.push({ view, baseY: agent.position.y });
        }

        let elapsed = 0;
        app.ticker.add((ticker) => {
          elapsed += ticker.deltaTime * 0.045;
          for (const sleeper of sleepers) sleeper.view.y = sleeper.baseY + Math.sin(elapsed) * 0.9;
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
