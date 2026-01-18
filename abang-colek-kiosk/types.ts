
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
export interface MenuItem {
  name: string;
  price: number;
  description?: string;
}

export interface OrderItem extends MenuItem {
  id: string;
  ingredients?: string[];
}

export interface FlyingIngredient {
  id: string;
  svg: string;
  top: string; // CSS percentage for vertical position
}

export type SceneState = 'order' | 'pickup';

export const MENU: MenuItem[] = [
    { name: "JUMBO COLEX MIX", price: 15.00 },
    { name: "JUMBO COLEX SINGLE", price: 15.00 },
    { name: "SAMBAL COLEX BOX", price: 15.00 },
    { name: "COMBO 5 COLEX", price: 75.00, description: "Jumbo Colex, Sambal Box" },
    { name: "COMBO 10 COLEX", price: 150.00, description: "Jumbo Colex, Sambal Box, #FREE" }
];
