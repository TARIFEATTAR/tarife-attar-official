/**
 * Viscosity Input Component
 * 
 * Custom Sanity input for "The Relic" collection to visualize oil thickness.
 * As the slider moves right (thicker), the preview box transitions from
 * Light Amber (#F2F0E9) to Deep Resin (#3D1C02).
 */

import React from 'react';
import { set, unset, PatchEvent } from 'sanity';
import { Stack, Card, Text } from '@sanity/ui';

interface ViscosityInputProps {
  value?: number;
  onChange: (event: PatchEvent) => void;
  schemaType: {
    options?: {
      min?: number;
      max?: number;
      step?: number;
    };
  };
}

/**
 * Interpolates between two hex colors
 */
function interpolateColor(color1: string, color2: string, factor: number): string {
  const hex1 = color1.replace('#', '');
  const hex2 = color2.replace('#', '');
  
  const r1 = parseInt(hex1.substring(0, 2), 16);
  const g1 = parseInt(hex1.substring(2, 4), 16);
  const b1 = parseInt(hex1.substring(4, 6), 16);
  
  const r2 = parseInt(hex2.substring(0, 2), 16);
  const g2 = parseInt(hex2.substring(2, 4), 16);
  const b2 = parseInt(hex2.substring(4, 6), 16);
  
  const r = Math.round(r1 + (r2 - r1) * factor);
  const g = Math.round(g1 + (g2 - g1) * factor);
  const b = Math.round(b1 + (b2 - b1) * factor);
  
  return `#${[r, g, b].map(x => x.toString(16).padStart(2, '0')).join('')}`;
}

export const ViscosityInput: React.FC<ViscosityInputProps> = ({
  value = 0,
  onChange,
  schemaType,
}) => {
  const min = schemaType.options?.min ?? 0;
  const max = schemaType.options?.max ?? 100;
  const step = schemaType.options?.step ?? 1;

  const handleChange = (newValue: number | number[]) => {
    const numValue = Array.isArray(newValue) ? newValue[0] : newValue;
    onChange(PatchEvent.from(numValue === undefined ? unset() : set(numValue)));
  };

  // Calculate color based on value (0 = Light Amber, 100 = Deep Resin)
  const normalizedValue = (value - min) / (max - min);
  const previewColor = interpolateColor('#F2F0E9', '#3D1C02', normalizedValue);

  return (
    <Stack space={4}>
      <Card padding={4} style={{ backgroundColor: previewColor }} radius={2}>
        <Text size={1} weight="semibold" style={{ color: normalizedValue > 0.5 ? '#F2F0E9' : '#1A1A1A' }}>
          Viscosity Preview
        </Text>
        <Text size={0} muted style={{ color: normalizedValue > 0.5 ? '#F2F0E9' : '#1A1A1A', marginTop: 8 }}>
          {value} / {max}
        </Text>
      </Card>
      
      <input
        type="range"
        value={value}
        min={min}
        max={max}
        step={step}
        onChange={(e) => handleChange(Number(e.target.value))}
        style={{ width: '100%' }}
      />
      
      <Text size={0} muted>
        Adjust viscosity: {value < 25 ? 'Ethereal / Mist' : value < 50 ? 'Fluid / Serum' : value < 75 ? 'Dense / Balm' : 'Concrete / Ointment'}
      </Text>
    </Stack>
  );
};
