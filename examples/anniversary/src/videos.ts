import {PossibleColor} from '@motion-canvas/core';

interface VideoClip {
  channel: string;
  title: string;
  avatar: string;
  link: string;
  color?: PossibleColor;
}

const Videos: VideoClip[] = [
  {
    avatar:
      'https://yt3.ggpht.com/ytc/AIf8zZS7J6Gy2dcZR7Qbu17lIYM3lh8cpZ_vOMeC3xoXiQ=s176-c-k-c0x00ffffff-no-rj',
    channel: 'Kai Sassnowski',
    link: 'otO3G7u-bXo',
    title: 'Coordinate Spaces for 2D Game Developers',
    color: '#131215',
  },
  {
    avatar:
      'https://yt3.ggpht.com/m0Cuf6EQkRaHk2uTbsAwj3-11Pgf2kXymtEV2_ery1FqkZstX1M2DA5VXK-VNg3vhOjxtAFpyW0=s176-c-k-c0x00ffffff-no-rj',
    channel: 'Full Stack',
    link: 'jB9PVK1DuN0',
    title: 'Explaining the Internet in less than 3 Minutes',
    color: '#24293f',
  },
  {
    avatar:
      'https://yt3.ggpht.com/6bbTq3EaxOhTTqjyOLW-RHkIaOTQPfGR8r8Qpt2lR0U7AqHpkeXqZhFdUSqw77PGhOIys4Nf=s176-c-k-c0x00ffffff-no-rj',
    channel: 'Koda Coda',
    link: 'BK0Vxe_i0Bs',
    title:
      'this animation can make dark theme lovers switch to light theme a couple times',
    color: '#131313',
  },
  {
    avatar:
      'https://yt3.ggpht.com/ytc/AIf8zZSPoH-SgKRRUnxYBmg9Wr1hBoLmI8mFzjs5zv69mQ=s176-c-k-c0x00ffffff-no-rj',
    channel: 'CactusPuppy',
    link: 'ffhp0yfRPpk',
    title: 'A deep dive into how respawn waves work in Overwatch 2',
    color: '#141414',
  },
  {
    avatar:
      'https://yt3.ggpht.com/ytc/AIf8zZSaujxfVVBKp8F0pPj3Tdt5Yi8YUiGYB2G1hLFj4w=s176-c-k-c0x00ffffff-no-rj',
    channel: 'VoxelRifts',
    link: '3IAlJSIjvH0',
    title: 'Arenas, strings and Scuffed Templates in C',
    color: '#020202',
  },
  {
    avatar:
      'https://yt3.ggpht.com/drgTaCj5o7KinL7v5t-RaC6NGtfZU_1W8BRcYbIFtHEQ-A3YP-UHbVwzrfbWgcqOjG-D5AG0Cw=s176-c-k-c0x00ffffff-no-rj',
    channel: 'Andrei Cn',
    link: '6v4au72nWNE',
    title: 'Revealing the math behind REFLECTIONS',
    color: '#040606',
  },
  {
    avatar:
      'https://yt3.googleusercontent.com/G2lab_gYoqBsNyU8RFwj_S1MXFNk24dnJxUNRgdkb6QiP16W6UELSz8KZHBzqqHVuPHJ5tea5m4=s176-c-k-c0x00ffffff-no-rj',
    channel: 'Thomsr',
    link: 'STn33z8V6kM',
    title: 'Insertion Sort in 5 Minutes',
  },
  {
    avatar:
      'https://yt3.ggpht.com/ytc/AIf8zZRqBooAFqoukcgT6h6pOQjTQbb9LUDuVE6dg1bUXQ=s176-c-k-c0x00ffffff-no-rj',
    channel: 'Madrigal',
    link: 'zBhhckL5Q4k',
    title: 'Making a video recorder for a game engine, from scratch',
    color: null,
  },
  {
    avatar:
      'https://yt3.ggpht.com/trXsxHovX-3GnjxTsDnSw1FRfCvKPZ1ZlJsKPJg8oy1F4wLuqJv-1LiO0U4zZwoVvN0M_BjzmQ=s176-c-k-c0x00ffffff-no-rj',
    channel: 'uujuju',
    link: 'NpFzCfCZxaQ',
    title: 'Vibration System introduction',
  },
  {
    avatar:
      'https://yt3.ggpht.com/ytc/AIf8zZQglrVLwnCiXUqh-YZj01aJtZQwEvjrN-TAjGd6oM-NyqSBycRKBFIKvOf3P5wL=s176-c-k-c0x00ffffff-no-rj',
    channel: 'cheesecake coding',
    link: 'XzsWP3GjzWU',
    title: 'Bookshelf animation',
    color: '#141718',
  },
  {
    avatar:
      'https://yt3.ggpht.com/ytc/AIf8zZTG-wvSUfmPsw2s4i970ed_n3m1ADb9MDtkwAm1lQ=s176-c-k-c0x00ffffff-no-rj',
    channel: 'LooseJuice',
    link: 'eYZhFHrfGOo',
    title: "Omni Devlog #1 - I'm making a game engine! :0",
    color: '#171717',
  },
  {
    avatar:
      'https://yt3.ggpht.com/0aLAXOlDnE5ozLk1rzI5sTmz9X0Pd-N_fx-U7D_VcfwkNhb63tx9Y8Jz4NW9l5fHAWlQ3xo5=s176-c-k-c0x00ffffff-no-rj',
    channel: 'Aarthix',
    link: 'u3qAxOnjAEI',
    title: 'Best GAME ENGINE | BEVY vs GODOT',
  },
  {
    avatar:
      'https://yt3.ggpht.com/ytc/AIf8zZT1tUEYYf_vyaAx3cbBHBj9Dzmx2TqPbHQxJqZ_4qGwD9_WWm3IuHt5_VXIAqpC=s176-c-k-c0x00ffffff-no-rj',
    channel: 'The Mathematical Thinker',
    link: 'sZpOR7WuTII',
    title: 'Trigonometry: How did we get from triangles to circles?',
  },
  {
    avatar:
      'https://yt3.ggpht.com/D4XeX6bvuy8c_eqO4ZMQcCvgchiY-5a6UXdbU-p-z4Bysl_n4eEHPs3UXnzQiasYky3jVK0tMw=s176-c-k-c0x00ffffff-no-rj',
    channel: 'Ali Naci Erdem',
    link: 'MMuboIEJA5Q',
    title: 'HTTP: The language of internet',
    color: '#000000',
  },
  {
    avatar:
      'https://yt3.ggpht.com/1gSHMQMeIH_FiqxmffmAws20dBA6suGKWOaEHLbx4tC-B4tCl2f9OC1tqbuY4Mu4_3yTX4QUJA=s176-c-k-c0x00ffffff-no-rj',
    channel: 'angel division',
    link: 'lbTlEY0j4bU',
    title: 'Make a VR game in one month or lose $500',
    color: '#15181f',
  },
  {
    avatar:
      'https://yt3.ggpht.com/qVtLZsL5eXfYwsqzNRWyxHucm_Kc_xw7HGoJAx2xM30hKck18E4zJOtMABeCW87ras-EA5vADgQ=s176-c-k-c0x00ffffff-no-rj',
    channel: 'BitByteBuild',
    link: 'HjIYZbQP-6Q',
    title: 'Accessing memory location in C',
    color: '#26231f',
  },
  {
    avatar:
      'https://yt3.ggpht.com/ytc/AIf8zZTJdJ9h_-SOnfXE7XvzNBfrXy49d4z6Y6kJ4gzk=s176-c-k-c0x00ffffff-no-rj',
    channel: 'Gamba Goons',
    link: 'clT-KrXtUSk',
    title: 'How Tears of the Kingdom Fundamentally CHANGED the Zelda Timeline!',
    color: '#1a120c',
  },
  {
    avatar:
      'https://yt3.ggpht.com/ytc/AIf8zZTAuwYoqLBkDSqsN82AA_6T8fRp0wVKCW8k60dqQw=s176-c-k-c0x00ffffff-no-rj',
    channel: 'Bilal İnci',
    link: 'WpwYqPk04sk',
    title: 'Electric Field',
    color: '#242424',
  },
  {
    avatar:
      'https://yt3.ggpht.com/qtCjj3QJvzHFmbzkSj_RdO0Mjw1I_sOPxpS0eDt6J3QB8d_THhrkqrAgRSydPBcNtIJDfwRdYg=s48-c-k-c0x00ffffff-no-rj',
    channel: 'Tomatech',
    link: 'UtbsRyzQ6VE',
    title: 'Collision Detection Part 2 | Super Smashy Maker Technical Devlog',
    color: '#131313',
  },
  {
    avatar:
      'https://yt3.ggpht.com/v3K379HhwUXncRaHpDaZ2Ek8wk6yqFAl_lJGm7U9R94PVS-kNk8nTKt3HrexEc6oAU1HyBjmmuM=s176-c-k-c0x00ffffff-no-rj',
    channel: 'SebiTCR',
    link: 'Enq64V_HmSM',
    title: 'A modular approach to FTC codebases',
    color: '#1a1a1a',
  },
  {
    avatar:
      'https://yt3.googleusercontent.com/ytc/AIf8zZQtSz0KyljWQwzgIeJTjF1v99Tp51yFMWG1ZKYpvw=s176-c-k-c0x00ffffff-no-rj',
    channel: 'Harshith Ashvi',
    link: 'fiLmV2_7r1w',
    title: 'Mungaru Male Dialogue Animation',
    color: '#01232c',
  },
  {
    avatar:
      'https://yt3.ggpht.com/AVmrrC0DOH2U3edS_5UmTsJiMjX8PPJGbGWUQgIrBZWAivNa6GgR0sykgeG-2uqbqcMtk220tQ=s176-c-k-c0x00ffffff-no-rj',
    channel: 'CIOSAI石獅',
    link: 'oAU-pC4gE0g',
    title: '[Godot 4] 7 Major gdscript Changes! Await? Lambda?',
  },
];

export default Videos;
