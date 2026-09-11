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

const hairColors: Record<string, number> = {
  yoda: 0x252b3f,
  bb8: 0xd96f2d,
  aria: 0xe875a6,
  forge: 0x1f293b,
  research: 0xd6a84b,
  ops: 0x214f7c,
};

const hairHighlights: Record<string, number> = {
  yoda: 0x39435e,
  bb8: 0xf09242,
  aria: 0xf59bc0,
  forge: 0x36445e,
  research: 0xf0c667,
  ops: 0x3475a8,
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
      dropShadow: { color: 0x07101c, blur: 0, angle: Math.PI / 4, distance: 2, alpha: 0.75 },
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
  floor.rect(0, 0, WORLD_SIZE.width, WORLD_SIZE.height).fill({ color: 0xbeb49d });
  const tile = 32;
  for (let y = 0; y < WORLD_SIZE.height; y += tile) {
    for (let x = 0; x < WORLD_SIZE.width; x += tile) {
      const alternate = ((x / tile) + (y / tile)) % 2 === 0;
      floor.rect(x, y, tile, tile).fill({ color: alternate ? 0xcac1ab : 0xb7ad96, alpha: 0.64 });
      floor.rect(x, y, tile, 2).fill({ color: 0xeee5cf, alpha: 0.22 });
      floor.rect(x, y, 2, tile).fill({ color: 0x7f7768, alpha: 0.13 });
    }
  }
  group.addChild(floor);

  const wall = new PIXI.Graphics();
  wall.roundRect(5, 5, WORLD_SIZE.width - 10, WORLD_SIZE.height - 10, 18).stroke({ color: 0x0a1220, width: 22 });
  wall.roundRect(14, 14, WORLD_SIZE.width - 28, WORLD_SIZE.height - 28, 12).stroke({ color: 0x4a6179, width: 5 });
  wall.roundRect(21, 21, WORLD_SIZE.width - 42, WORLD_SIZE.height - 42, 10).stroke({ color: 0x263d55, width: 4 });
  group.addChild(wall);
  return group;
}

function drawWallLamp(PIXI: PixiModule, x: number, y: number) {
  const lamp = new PIXI.Container();
  const halo = new PIXI.Graphics();
  halo.circle(x, y, 26).fill({ color: 0xffc96d, alpha: 0.12 });
  const body = new PIXI.Graphics();
  body.rect(x - 7, y - 7, 14, 16).fill({ color: 0xf5a83c }).stroke({ color: 0x70421e, width: 2 });
  body.rect(x - 4, y - 4, 8, 9).fill({ color: 0xffe1a0 });
  lamp.addChild(halo, body);
  return lamp;
}

function drawPlant(PIXI: PixiModule, x: number, y: number, scale = 1) {
  const plant = new PIXI.Container();
  plant.position.set(x, y);
  plant.scale.set(scale);
  const shadow = new PIXI.Graphics();
  shadow.ellipse(0, 14, 18, 6).fill({ color: 0x11151b, alpha: 0.18 });
  const pot = new PIXI.Graphics();
  pot.rect(-12, 1, 24, 17).fill({ color: 0xb36e32 }).stroke({ color: 0x6f3e1d, width: 2 });
  pot.rect(-9, 17, 18, 5).fill({ color: 0x7c4827 });
  const leaves = new PIXI.Graphics();
  leaves.circle(-9, -7, 11).fill({ color: 0x3f8f48 });
  leaves.circle(8, -10, 12).fill({ color: 0x5cb65f });
  leaves.circle(-1, -20, 13).fill({ color: 0x4aa454 });
  leaves.rect(-4, -12, 8, 15).fill({ color: 0x2c7139 });
  plant.addChild(shadow, pot, leaves);
  return plant;
}

function drawPaper(PIXI: PixiModule, x: number, y: number, rotation = 0) {
  const paper = new PIXI.Graphics();
  paper.position.set(x, y);
  paper.rotation = rotation;
  paper.rect(-12, -9, 24, 18).fill({ color: 0xf0e7d4 }).stroke({ color: 0xa99c82, width: 1 });
  paper.rect(-7, -4, 14, 2).fill({ color: 0xa39a8a });
  paper.rect(-7, 1, 10, 2).fill({ color: 0xb2a795 });
  return paper;
}

function drawMug(PIXI: PixiModule, x: number, y: number, color = 0xe8e3d5) {
  const mug = new PIXI.Graphics();
  mug.circle(x, y, 7).fill({ color }).stroke({ color: 0x796f64, width: 1 });
  mug.circle(x + 8, y, 4).stroke({ color: 0x796f64, width: 2 });
  mug.circle(x, y, 3).fill({ color: 0x6f4732 });
  return mug;
}

function drawChair(PIXI: PixiModule, x: number, y: number, facing: 'up' | 'down' = 'down') {
  const chair = new PIXI.Container();
  const g = new PIXI.Graphics();
  const backY = facing === 'down' ? -12 : 10;
  g.roundRect(x - 20, y + backY, 40, 26, 5).fill({ color: 0x2e63a5 }).stroke({ color: 0x163758, width: 3 });
  g.rect(x - 15, y + (facing === 'down' ? 13 : -10), 30, 18).fill({ color: 0x244d82 }).stroke({ color: 0x163758, width: 2 });
  g.rect(x - 14, y + (facing === 'down' ? 31 : 8), 5, 10).fill({ color: 0x172d47 });
  g.rect(x + 9, y + (facing === 'down' ? 31 : 8), 5, 10).fill({ color: 0x172d47 });
  chair.addChild(g);
  return chair;
}

function drawMonitor(PIXI: PixiModule, x: number, y: number, width = 68, glow = 0x46d9ff) {
  const monitor = new PIXI.Container();
  const g = new PIXI.Graphics();
  g.roundRect(x - width / 2, y - 25, width, 40, 4).fill({ color: 0x0c1b2a }).stroke({ color: 0x355d80, width: 3 });
  g.rect(x - width / 2 + 7, y - 18, width - 14, 25).fill({ color: 0x0e3450 });
  g.rect(x - width / 2 + 11, y - 14, width - 22, 3).fill({ color: glow, alpha: 0.82 });
  g.rect(x - 4, y + 15, 8, 12).fill({ color: 0x34485a });
  g.rect(x - 14, y + 27, 28, 4).fill({ color: 0x24384a });
  monitor.addChild(g);
  return monitor;
}

function drawDesk(PIXI: PixiModule, x: number, y: number, width = 170, accent = 0x4ecfff) {
  const furniture = new PIXI.Container();
  const shadow = new PIXI.Graphics();
  shadow.roundRect(x - width / 2 + 4, y + 7, width, 54, 8).fill({ color: 0x101010, alpha: 0.18 });
  const desk = new PIXI.Graphics();
  desk.roundRect(x - width / 2, y, width, 48, 7).fill({ color: 0x91603e }).stroke({ color: 0x51331f, width: 3 });
  desk.rect(x - width / 2 + 5, y + 6, width - 10, 5).fill({ color: 0xc1895b, alpha: 0.65 });
  desk.rect(x - width / 2 + 13, y + 48, 9, 20).fill({ color: 0x51331f });
  desk.rect(x + width / 2 - 22, y + 48, 9, 20).fill({ color: 0x51331f });
  furniture.addChild(shadow, desk, drawMonitor(PIXI, x, y - 7, 72, accent), drawPaper(PIXI, x - width / 2 + 28, y + 19, -0.14), drawMug(PIXI, x + width / 2 - 28, y + 18));
  return furniture;
}

function drawRoomFrame(PIXI: PixiModule, room: OfficeZone, floorColor = 0x1b293e) {
  const group = new PIXI.Container();
  const shadow = new PIXI.Graphics();
  shadow.roundRect(room.x + 6, room.y + 8, room.width, room.height, 10).fill({ color: 0x000000, alpha: 0.18 });
  const shell = new PIXI.Graphics();
  shell.roundRect(room.x, room.y, room.width, room.height, 10).fill({ color: floorColor }).stroke({ color: 0x24394e, width: 10 });
  shell.rect(room.x + 10, room.y + 10, room.width - 20, 26).fill({ color: 0x101b2a });
  shell.rect(room.x + 12, room.y + 38, room.width - 24, 3).fill({ color: 0x465b6d });
  group.addChild(shadow, shell);
  return group;
}

function drawSign(PIXI: PixiModule, text: string, x: number, y: number, width: number) {
  const sign = new PIXI.Container();
  const box = new PIXI.Graphics();
  box.roundRect(x - width / 2, y - 16, width, 32, 3).fill({ color: 0x0f1c2d }).stroke({ color: 0x5a7da0, width: 2 });
  box.rect(x - width / 2 + 5, y - 12, width - 10, 2).fill({ color: 0x244d72 });
  sign.addChild(box, addText(PIXI, text, x, y, 13, 0xf1f6ff));
  return sign;
}

function drawPoster(PIXI: PixiModule, x: number, y: number, lines: string[]) {
  const poster = new PIXI.Container();
  const g = new PIXI.Graphics();
  g.rect(x, y, 74, 112).fill({ color: 0xf2ead7 }).stroke({ color: 0x776c5b, width: 2 });
  g.rect(x + 5, y + 5, 64, 5).fill({ color: 0xd7cbb3 });
  poster.addChild(g);
  lines.forEach((line, index) => poster.addChild(addText(PIXI, line, x + 37, y + 27 + index * 19, 11, 0x214f8a)));
  return poster;
}

function drawMeetingRoom(PIXI: PixiModule) {
  const room = zone('meeting-room');
  const group = drawRoomFrame(PIXI, room, 0x1b2a40);
  group.addChild(drawSign(PIXI, 'MEETING ROOM', room.x + room.width / 2, room.y + 29, 178));

  const table = new PIXI.Graphics();
  table.roundRect(room.x + 86, room.y + 92, room.width - 172, 92, 8).fill({ color: 0x9a6541 }).stroke({ color: 0x5a3a27, width: 4 });
  table.rect(room.x + 93, room.y + 98, room.width - 186, 6).fill({ color: 0xc18456, alpha: 0.72 });
  group.addChild(table);

  const chairXs = [room.x + 112, room.x + 196, room.x + 280];
  chairXs.forEach((x) => {
    group.addChild(drawChair(PIXI, x, room.y + 70, 'down'));
    group.addChild(drawChair(PIXI, x, room.y + 192, 'up'));
  });

  group.addChild(
    drawPaper(PIXI, room.x + 145, room.y + 127, -0.12),
    drawPaper(PIXI, room.x + 235, room.y + 147, 0.1),
    drawPaper(PIXI, room.x + 284, room.y + 119, -0.05),
    drawPlant(PIXI, room.x + room.width - 34, room.y + room.height - 30, 0.92),
    drawPoster(PIXI, room.x + 12, room.y + 58, ['PLAN', 'BUILD', 'SHIP', '♡']),
    drawWallLamp(PIXI, room.x + 54, room.y + 47),
    drawWallLamp(PIXI, room.x + room.width - 54, room.y + 47),
  );
  return group;
}

function drawLobby(PIXI: PixiModule) {
  const room = zone('lobby');
  const group = new PIXI.Container();
  const backdrop = new PIXI.Graphics();
  backdrop.roundRect(room.x, room.y, room.width, room.height, 8).fill({ color: 0xd8caa9 }).stroke({ color: 0x766f61, width: 4 });
  backdrop.rect(room.x + 7, room.y + 7, room.width - 14, 27).fill({ color: 0x152239 });
  backdrop.rect(room.x + 12, room.y + 40, room.width - 24, 4).fill({ color: 0xeee4cb, alpha: 0.5 });
  group.addChild(backdrop, drawSign(PIXI, 'OC3  ·  IDEAS  ·  AGENTS  ·  IMPACT', room.x + room.width / 2, room.y + 25, room.width - 26));
  group.addChild(addText(PIXI, 'OC3', room.x + room.width / 2, room.y + 92, 54, 0x243b61));
  group.addChild(addText(PIXI, 'IDEAS   ·   AGENTS   ·   IMPACT', room.x + room.width / 2, room.y + 138, 12, 0x3d5b7c));
  group.addChild(drawPlant(PIXI, room.x + 34, room.y + room.height - 27, 0.95));
  group.addChild(drawPlant(PIXI, room.x + room.width - 34, room.y + room.height - 27, 0.95));
  return group;
}

function drawRobot(PIXI: PixiModule, x: number, y: number) {
  const robot = new PIXI.Container();
  const g = new PIXI.Graphics();
  g.roundRect(x - 23, y - 28, 46, 46, 14).fill({ color: 0xe7edf4 }).stroke({ color: 0x9dadbb, width: 3 });
  g.roundRect(x - 17, y - 18, 34, 20, 8).fill({ color: 0x152a43 });
  g.circle(x, y - 8, 5).fill({ color: 0x58ddff });
  g.roundRect(x - 17, y + 16, 34, 31, 9).fill({ color: 0xd7e1eb }).stroke({ color: 0x9dadbb, width: 3 });
  g.rect(x - 27, y + 22, 10, 18).fill({ color: 0xc8d4e0 });
  g.rect(x + 17, y + 22, 10, 18).fill({ color: 0xc8d4e0 });
  robot.addChild(g);
  return robot;
}

function drawAiLab(PIXI: PixiModule) {
  const room = zone('ai-lab');
  const group = drawRoomFrame(PIXI, room, 0x19283b);
  group.addChild(drawSign(PIXI, 'AI LAB / MODELS', room.x + room.width / 2, room.y + 29, 182));

  const screen = new PIXI.Graphics();
  screen.roundRect(room.x + 145, room.y + 60, 190, 86, 5).fill({ color: 0x073452 }).stroke({ color: 0x35d9ff, width: 4 });
  screen.rect(room.x + 154, room.y + 69, 172, 68).fill({ color: 0x0b4664, alpha: 0.65 });
  screen.circle(room.x + 240, room.y + 103, 27).stroke({ color: 0x55e8ff, width: 3 });
  screen.moveTo(room.x + 213, room.y + 103).lineTo(room.x + 267, room.y + 103).stroke({ color: 0x55e8ff, width: 2 });
  screen.rect(room.x + 172, room.y + 79, 28, 4).fill({ color: 0x52dfff, alpha: 0.8 });
  screen.rect(room.x + 280, room.y + 120, 28, 4).fill({ color: 0x52dfff, alpha: 0.8 });
  group.addChild(screen);

  const shelf = new PIXI.Graphics();
  shelf.rect(room.x + 60, room.y + 60, 58, 112).fill({ color: 0x533e31 }).stroke({ color: 0x2f241f, width: 3 });
  for (let row = 0; row < 4; row += 1) {
    shelf.rect(room.x + 68, room.y + 72 + row * 24, 42, 5).fill({ color: 0x2e79a8 });
    shelf.rect(room.x + 72 + (row % 2) * 8, room.y + 78 + row * 24, 7, 13).fill({ color: row % 2 ? 0xd7b04b : 0x6cb6c8 });
  }
  group.addChild(shelf, drawRobot(PIXI, room.x + 105, room.y + 190));
  group.addChild(drawDesk(PIXI, room.x + 310, room.y + 182, 126, 0x45d8ff));
  group.addChild(drawDesk(PIXI, room.x + 400, room.y + 182, 112, 0x45d8ff));
  group.addChild(drawPoster(PIXI, room.x + room.width - 82, room.y + 56, ['BETTER', 'MODELS', 'KINDER', 'WORLD']));
  group.addChild(drawPlant(PIXI, room.x + 132, room.y + 59, 0.8));
  group.addChild(drawWallLamp(PIXI, room.x + 38, room.y + 47), drawWallLamp(PIXI, room.x + room.width - 38, room.y + 47));
  return group;
}

function drawLounge(PIXI: PixiModule) {
  const room = zone('lounge');
  const group = new PIXI.Container();
  const rug = new PIXI.Graphics();
  rug.roundRect(room.x + 30, room.y + 75, room.width - 60, room.height - 96, 8).fill({ color: 0x2a4e78, alpha: 0.68 });
  rug.rect(room.x + 38, room.y + 83, room.width - 76, room.height - 112).stroke({ color: 0x486e98, width: 2, alpha: 0.55 });
  group.addChild(rug, drawSign(PIXI, 'LOUNGE', room.x + room.width / 2, room.y + 26, 142));

  const couch = new PIXI.Graphics();
  couch.roundRect(room.x + 44, room.y + 87, 190, 62, 12).fill({ color: 0x2a5b9d }).stroke({ color: 0x17385e, width: 4 });
  couch.roundRect(room.x + 61, room.y + 140, 156, 35, 8).fill({ color: 0x346ab0 }).stroke({ color: 0x17385e, width: 3 });
  couch.rect(room.x + 52, room.y + 97, 10, 45).fill({ color: 0x244a7d });
  couch.rect(room.x + 216, room.y + 97, 10, 45).fill({ color: 0x244a7d });
  const table = new PIXI.Graphics();
  table.roundRect(room.x + 92, room.y + 184, 106, 36, 7).fill({ color: 0x835638 }).stroke({ color: 0x513622, width: 3 });
  group.addChild(couch, table, drawPaper(PIXI, room.x + 126, room.y + 201, -0.08), drawMug(PIXI, room.x + 172, room.y + 201));

  const cooler = new PIXI.Graphics();
  cooler.rect(room.x + 247, room.y + 150, 34, 58).fill({ color: 0xe6ecef }).stroke({ color: 0x778895, width: 2 });
  cooler.roundRect(room.x + 251, room.y + 118, 26, 37, 11).fill({ color: 0x7bd8ff, alpha: 0.75 }).stroke({ color: 0x4f91ab, width: 2 });
  cooler.rect(room.x + 254, room.y + 174, 20, 4).fill({ color: 0x6c7d86 });
  group.addChild(cooler, drawPoster(PIXI, room.x + 8, room.y + 95, ['A', 'BRIGHTER', 'TOMORROW', '♡']), drawPlant(PIXI, room.x + room.width - 28, room.y + 89, 0.86));
  return group;
}

function drawServerRoom(PIXI: PixiModule) {
  const room = zone('servers');
  const group = drawRoomFrame(PIXI, room, 0x152238);
  group.addChild(drawSign(PIXI, 'SERVERS / LOGS', room.x + room.width / 2, room.y + 28, 176));
  for (let i = 0; i < 4; i += 1) {
    const x = room.x + 38 + i * 66;
    const rack = new PIXI.Graphics();
    rack.roundRect(x, room.y + 70, 52, 132, 4).fill({ color: 0x0e1828 }).stroke({ color: 0x35516c, width: 3 });
    rack.rect(x + 7, room.y + 79, 38, 7).fill({ color: 0x203348 });
    for (let row = 0; row < 5; row += 1) {
      rack.rect(x + 9, room.y + 94 + row * 20, 34, 6).fill({ color: row % 2 ? 0x1fe0a0 : 0x32a9e8 });
      rack.circle(x + 13, room.y + 97 + row * 20, 2).fill({ color: 0xbfffe7 });
    }
    group.addChild(rack);
  }
  const terminal = new PIXI.Graphics();
  terminal.roundRect(room.x + 228, room.y + 198, 95, 52, 5).fill({ color: 0x07190f }).stroke({ color: 0x2c8253, width: 3 });
  for (let row = 0; row < 4; row += 1) terminal.rect(room.x + 239, room.y + 208 + row * 9, 54 - row * 5, 3).fill({ color: 0x39ef8b });
  const crates = new PIXI.Graphics();
  crates.rect(room.x + room.width - 70, room.y + 188, 44, 44).fill({ color: 0xa57042 }).stroke({ color: 0x5f3e24, width: 3 });
  crates.moveTo(room.x + room.width - 65, room.y + 193).lineTo(room.x + room.width - 31, room.y + 227).stroke({ color: 0x6e4829, width: 2 });
  crates.moveTo(room.x + room.width - 31, room.y + 193).lineTo(room.x + room.width - 65, room.y + 227).stroke({ color: 0x6e4829, width: 2 });
  group.addChild(terminal, crates, drawPoster(PIXI, room.x + room.width - 78, room.y + 62, ['LOGS', 'KEEP', 'US', 'HONEST']), drawPlant(PIXI, room.x + room.width - 29, room.y + 52, 0.75));
  return group;
}

function drawOpenOffice(PIXI: PixiModule) {
  const group = new PIXI.Container();

  const aisle = new PIXI.Graphics();
  aisle.roundRect(394, 232, 392, 278, 8).fill({ color: 0xd8cdb2, alpha: 0.62 });
  aisle.rect(406, 245, 368, 2).fill({ color: 0xeee5cf, alpha: 0.48 });
  group.addChild(aisle);

  group.addChild(
    drawPlant(PIXI, 412, 274, 0.9),
    drawPlant(PIXI, 782, 274, 0.9),
    drawPlant(PIXI, 1115, 294, 0.82),
    drawPlant(PIXI, 60, 288, 0.82),
  );

  const deskSpecs = [
    { x: 264, y: 380, label: 'Yoda', role: 'Lead Agent', accent: 0x54d8ff },
    { x: 572, y: 380, label: 'BB8', role: 'Messenger', accent: 0x54d8ff },
    { x: 880, y: 380, label: 'Aria', role: 'Approval', accent: 0x54d8ff },
  ];
  deskSpecs.forEach((desk) => {
    group.addChild(drawDesk(PIXI, desk.x, desk.y, 174, desk.accent));
    const plate = new PIXI.Graphics();
    plate.roundRect(desk.x - 57, desk.y + 52, 114, 34, 5).fill({ color: 0x112440 }).stroke({ color: 0x3c6c9b, width: 2 });
    group.addChild(plate, addText(PIXI, desk.label, desk.x, desk.y + 64, 14, 0xf4f8ff), addText(PIXI, desk.role, desk.x, desk.y + 79, 9, 0x8cbde8));
  });

  group.addChild(drawDesk(PIXI, 470, 614, 160, 0x47cef8));
  group.addChild(drawDesk(PIXI, 680, 614, 160, 0x47cef8));

  const centerRug = new PIXI.Graphics();
  centerRug.roundRect(424, 690, 345, 54, 7).fill({ color: 0x2c4e84 }).stroke({ color: 0x426ca1, width: 3 });
  centerRug.rect(435, 701, 323, 32).stroke({ color: 0x6280a8, width: 2, alpha: 0.45 });
  group.addChild(centerRug, addText(PIXI, 'OC3', 596, 712, 27, 0xc5d8f2), addText(PIXI, 'PEOPLE × AGENTS × IMPACT', 596, 735, 10, 0x9cb9db));
  return group;
}

function drawOfficeBackdrop(PIXI: PixiModule) {
  const group = new PIXI.Container();
  group.addChild(drawTileFloor(PIXI));
  group.addChild(drawMeetingRoom(PIXI));
  group.addChild(drawLobby(PIXI));
  group.addChild(drawAiLab(PIXI));
  group.addChild(drawOpenOffice(PIXI));
  group.addChild(drawLounge(PIXI));
  group.addChild(drawServerRoom(PIXI));

  const corridorLights = new PIXI.Graphics();
  [390, 720].forEach((x) => {
    corridorLights.rect(x, 250, 7, 28).fill({ color: 0xf8c66c }).stroke({ color: 0x75491e, width: 2 });
    corridorLights.rect(x + 2, 255, 3, 15).fill({ color: 0xffe1a0 });
  });
  group.addChild(corridorLights);
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
    glow.roundRect(-54, -67, 108, 126, 14).fill({ color: 0x2fffd1, alpha: 0.1 }).stroke({ color: 0x4dffd6, width: 4, alpha: 0.92 });
    group.addChild(glow);
  }

  const shadow = new PIXI.Graphics();
  shadow.ellipse(0, 45, 31, 9).fill({ color: 0x08101d, alpha: 0.26 });
  group.addChild(shadow);

  const bodyY = agent.isSleeping ? 15 : 6;
  const body = new PIXI.Graphics();
  body.roundRect(-24, bodyY, 48, 38, 10).fill({ color: 0x143d69 }).stroke({ color: 0x10243b, width: 3 });
  body.rect(-5, bodyY + 2, 10, 26).fill({ color: 0xe8edf3 });
  body.rect(-2, bodyY + 7, 4, 18).fill({ color: agent.id === 'aria' ? 0xe878a6 : 0xcf4456 });
  body.roundRect(-31, bodyY + 5, 12, 27, 5).fill({ color: 0xf1c1a4 }).stroke({ color: 0x9a6e59, width: 1 });
  body.roundRect(19, bodyY + 5, 12, 27, 5).fill({ color: 0xf1c1a4 }).stroke({ color: 0x9a6e59, width: 1 });
  body.roundRect(-18, bodyY + 28, 14, 24, 5).fill({ color: 0x172840 });
  body.roundRect(4, bodyY + 28, 14, 24, 5).fill({ color: 0x172840 });
  body.rect(-18, bodyY + 47, 15, 5).fill({ color: 0x0d1726 });
  body.rect(3, bodyY + 47, 15, 5).fill({ color: 0x0d1726 });
  group.addChild(body);

  const headY = agent.isSleeping ? 6 : -20;
  const face = new PIXI.Graphics();
  face.roundRect(-37, headY - 30, 74, 62, 15).fill({ color: 0xf5c8ad }).stroke({ color: 0x1b2230, width: 4 });
  face.rect(-31, headY + 20, 62, 5).fill({ color: 0xe9ae92, alpha: 0.5 });

  const hair = hairColors[agent.id] ?? 0x343c4c;
  const highlight = hairHighlights[agent.id] ?? 0x4b586f;
  face.roundRect(-39, headY - 34, 78, 29, 13).fill({ color: hair });
  face.rect(-34, headY - 30, 18, 8).fill({ color: highlight, alpha: 0.72 });
  face.rect(1, headY - 31, 22, 7).fill({ color: highlight, alpha: 0.58 });
  face.roundRect(-40, headY - 16, 14, 34, 6).fill({ color: hair });
  face.roundRect(26, headY - 16, 14, 34, 6).fill({ color: hair });
  face.rect(-28, headY - 11, 10, 8).fill({ color: hair });
  face.rect(17, headY - 11, 10, 8).fill({ color: hair });

  if (agent.id === 'aria') {
    face.circle(29, headY - 31, 10).fill({ color: hair }).stroke({ color: 0x1b2230, width: 2 });
    face.rect(23, headY - 41, 12, 7).fill({ color: highlight });
  }

  if (agent.isSleeping) {
    face.moveTo(-20, headY + 6).lineTo(-8, headY + 6).stroke({ color: 0x202533, width: 3 });
    face.moveTo(8, headY + 6).lineTo(20, headY + 6).stroke({ color: 0x202533, width: 3 });
    face.moveTo(-5, headY + 19).lineTo(5, headY + 19).stroke({ color: 0xba6868, width: 2 });
  } else {
    face.roundRect(-22, headY - 1, 10, 14, 2).fill({ color: 0x111827 });
    face.roundRect(12, headY - 1, 10, 14, 2).fill({ color: 0x111827 });
    face.rect(-19, headY + 1, 3, 4).fill({ color: 0xffffff, alpha: 0.8 });
    face.rect(15, headY + 1, 3, 4).fill({ color: 0xffffff, alpha: 0.8 });
    face.rect(-8, headY + 21, 16, 3).fill({ color: 0xc55c6d });
    face.rect(-29, headY + 16, 8, 3).fill({ color: 0xe88c91, alpha: 0.55 });
    face.rect(21, headY + 16, 8, 3).fill({ color: 0xe88c91, alpha: 0.55 });
  }
  group.addChild(face);

  if (agent.id === 'yoda' && !agent.isSleeping) {
    const selectedMarker = new PIXI.Graphics();
    selectedMarker.moveTo(-9, -70).lineTo(9, -70).lineTo(0, -58).closePath().fill({ color: selected ? 0x43f1c5 : 0x5fdfff });
    group.addChild(selectedMarker);
  }

  if (agent.marker !== 'WORK') {
    const marker = addText(PIXI, agent.marker, 34, headY - 54, agent.isSleeping ? 21 : 14, agent.isSleeping ? 0xe7f4ff : 0x65e5ff);
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

        app.stage.addChild(drawOfficeBackdrop(PIXI));

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
          for (const sleeper of sleepers) sleeper.view.y = sleeper.baseY + Math.sin(elapsed) * 1.1;
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
