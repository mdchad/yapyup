import * as React from 'react';
import type { SvgProps } from 'react-native-svg';
import Svg, { Path } from 'react-native-svg';

import colors from '../colors';

export const Waveform = ({
  color = "#000",
  ...props
}: SvgProps) => (
  <Svg width={24} height={24} fill="none" viewBox="0 0 24 24" {...props}>
    <Path
      d="M5.25 9v6a0.75 0.75 0 0 1-1.5 0V9a0.75 0.75 0 0 1 1.5 0ZM8.25 2.25a0.75 0.75 0 0 0-0.75 0.75v18a0.75 0.75 0 0 0 1.5 0V3a0.75 0.75 0 0 0-0.75-0.75ZM12 5.25a0.75 0.75 0 0 0-0.75 0.75v12a0.75 0.75 0 0 0 1.5 0V6a0.75 0.75 0 0 0-0.75-0.75ZM15.75 8.25a0.75 0.75 0 0 0-0.75 0.75v6a0.75 0.75 0 0 0 1.5 0V9a0.75 0.75 0 0 0-0.75-0.75ZM19.5 6.75a0.75 0.75 0 0 0-0.75 0.75v9a0.75 0.75 0 0 0 1.5 0V7.5a0.75 0.75 0 0 0-0.75-0.75Z"
      fill={color}
    />
  </Svg>
);

// <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="#000000" viewBox="0 0 256 256"><path d="M56,96v64a8,8,0,0,1-16,0V96a8,8,0,0,1,16,0ZM88,24a8,8,0,0,0-8,8V224a8,8,0,0,0,16,0V32A8,8,0,0,0,88,24Zm40,32a8,8,0,0,0-8,8V192a8,8,0,0,0,16,0V64A8,8,0,0,0,128,56Zm40,32a8,8,0,0,0-8,8v64a8,8,0,0,0,16,0V96A8,8,0,0,0,168,88Zm40-16a8,8,0,0,0-8,8v96a8,8,0,0,0,16,0V80A8,8,0,0,0,208,72Z"></path></svg>
