import type { ComponentType } from 'react';
import type { SvgIconProps } from '@mui/material';
import LocalCafeIcon from '@mui/icons-material/LocalCafe';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import HubIcon from '@mui/icons-material/Hub';
import ExtensionIcon from '@mui/icons-material/Extension';
import DnsIcon from '@mui/icons-material/Dns';
import StorageIcon from '@mui/icons-material/Storage';
import CallSplitIcon from '@mui/icons-material/CallSplit';
import SchoolIcon from '@mui/icons-material/School';

const ICONS: Record<string, ComponentType<SvgIconProps>> = {
  java: LocalCafeIcon,
  oop: AccountTreeIcon,
  dsa: HubIcon,
  'design-patterns': ExtensionIcon,
  'system-design': DnsIcon,
  database: StorageIcon,
  multithreading: CallSplitIcon,
};

/** Renders the icon for a track id, falling back to a generic school icon. */
export function TrackIcon({ trackId, ...props }: { trackId: string } & SvgIconProps) {
  const Icon = ICONS[trackId] ?? SchoolIcon;
  return <Icon {...props} />;
}
