import React from 'react';
import { css } from '@emotion/css';
import { SimonButtonId } from '../SimonPlugin';

type Props = {
  id: SimonButtonId;
  highlighted: boolean;
  onTouchStart: (id: SimonButtonId) => void;
  onTouchEnd: (id: SimonButtonId) => void;
};

const generalStyle = css`
  position: absolute;
  width: 47.5%;
  height: 47.5%;
`;

export default function Button({
  id,
  highlighted,
  onTouchStart,
  onTouchEnd,
}: Props) {
  let specificStyle: string = '';
  if (id === 0) {
    specificStyle = css`
      top: 0;
      left: 0;
      background-color: ${highlighted ? '#feffbe' : '#9b9e00'};
      border-radius: 100% 0 0 0;
    `;
  } else if (id === 1) {
    specificStyle = css`
      top: 0;
      right: 0;
      background-color: ${highlighted ? '#addaff' : '#004680'};
      border-radius: 0 100% 0 0;
    `;
  } else if (id === 2) {
    specificStyle = css`
      bottom: 0;
      left: 0;
      background-color: ${highlighted ? '#ffa1c8' : '#96003e'};
      border-radius: 0 0 0 100%;
    `;
  } else if (id === 3) {
    specificStyle = css`
      bottom: 0;
      right: 0;
      background-color: ${highlighted ? '#afffd2' : '#007533'};
      border-radius: 0 0 100% 0;
    `;
  }

  return (
    <div
      className={`${generalStyle} ${specificStyle}`}
      onTouchStart={() => {
        onTouchStart(id);
      }}
      onTouchEnd={() => {
        onTouchEnd(id);
      }}
    ></div>
  );
}
