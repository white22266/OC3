export type HairStyle =
  | 'layered-messy'
  | 'soft-spiky'
  | 'high-ponytail'
  | 'sleepy-undercut'
  | 'side-swept-bob'
  | 'shaggy-back';

export type OutfitStyle = 'lead-jacket' | 'messenger-hoodie' | 'approval-cardigan' | 'builder-tee' | 'research-knit' | 'ops-jacket';

export interface AgentCharacterProfile {
  hairStyle: HairStyle;
  outfit: OutfitStyle;
  skin: number;
  hair: number;
  hairShadow: number;
  hairHighlight: number;
  jacket: number;
  shirt: number;
  accent: number;
  trouser: number;
  shoe: number;
  blush: number;
  accessory?: 'earpiece' | 'hair-ribbon' | 'hood' | 'glasses' | 'utility-belt';
}

export const agentCharacterProfiles: Record<string, AgentCharacterProfile> = {
  yoda: {
    hairStyle: 'layered-messy', outfit: 'lead-jacket', skin: 0xf2c3a3,
    hair: 0x1d2434, hairShadow: 0x111725, hairHighlight: 0x39435b,
    jacket: 0x173c69, shirt: 0xf2f3ee, accent: 0xd8535e, trouser: 0x17253b, shoe: 0x0c1422, blush: 0xe58b8e,
    accessory: 'earpiece',
  },
  bb8: {
    hairStyle: 'soft-spiky', outfit: 'messenger-hoodie', skin: 0xf3c4a6,
    hair: 0xd86525, hairShadow: 0x9f3e17, hairHighlight: 0xf38c39,
    jacket: 0xe06c2f, shirt: 0xf8e8d8, accent: 0x204b77, trouser: 0x223753, shoe: 0x111a29, blush: 0xea8e83,
    accessory: 'hood',
  },
  aria: {
    hairStyle: 'high-ponytail', outfit: 'approval-cardigan', skin: 0xf4c6ad,
    hair: 0xe36c9c, hairShadow: 0xa63f70, hairHighlight: 0xf5a3c1,
    jacket: 0xf08bb4, shirt: 0xfff3f5, accent: 0x68436e, trouser: 0x25344f, shoe: 0x111827, blush: 0xf08c9c,
    accessory: 'hair-ribbon',
  },
  forge: {
    hairStyle: 'sleepy-undercut', outfit: 'builder-tee', skin: 0xeebc9d,
    hair: 0x20283a, hairShadow: 0x111725, hairHighlight: 0x3a455e,
    jacket: 0x31527a, shirt: 0x324b65, accent: 0xd68b4e, trouser: 0x1b293f, shoe: 0x0c1420, blush: 0xdd7f7f,
  },
  research: {
    hairStyle: 'side-swept-bob', outfit: 'research-knit', skin: 0xf2c19f,
    hair: 0xd7a942, hairShadow: 0x9a6d25, hairHighlight: 0xf1ca68,
    jacket: 0xd8b66c, shirt: 0xf5ead7, accent: 0x3a6995, trouser: 0x22334c, shoe: 0x101722, blush: 0xe18a7f,
    accessory: 'glasses',
  },
  ops: {
    hairStyle: 'shaggy-back', outfit: 'ops-jacket', skin: 0xeab99a,
    hair: 0x285a88, hairShadow: 0x173a5e, hairHighlight: 0x3e7cb0,
    jacket: 0x18406f, shirt: 0x162b42, accent: 0x31d38d, trouser: 0x10243b, shoe: 0x0a121d, blush: 0xd77778,
    accessory: 'utility-belt',
  },
};
