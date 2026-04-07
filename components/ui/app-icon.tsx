import {
  ArrowsHorizontalIcon,
  ArrowClockwiseIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  BookIcon,
  CalendarBlankIcon,
  CaretRightIcon,
  ChartBarIcon,
  CheckCircleIcon,
  CheckIcon,
  ClockIcon,
  DotsThreeCircleIcon,
  DownloadSimpleIcon,
  FileTextIcon,
  FlameIcon,
  GearIcon,
  HourglassIcon,
  LightningIcon,
  ListBulletsIcon,
  type Icon,
  type IconProps,
  type IconWeight,
  NotebookIcon,
  PlayCircleIcon,
  PlayIcon,
  QuestionIcon,
  SparkleIcon,
  StarIcon,
  SunIcon,
  TrashIcon,
  UserIcon,
  WarningCircleIcon,
  XCircleIcon,
  XIcon,
} from 'phosphor-react-native';

export type AppIconName =
  | 'alert-circle'
  | 'alert-circle-outline'
  | 'analytics-outline'
  | 'arrow-back'
  | 'arrow-forward'
  | 'book'
  | 'calendar-outline'
  | 'chart.bar.fill'
  | 'checkmark'
  | 'checkmark-circle'
  | 'checkmark.circle.fill'
  | 'chevron-forward'
  | 'close'
  | 'close-circle'
  | 'document-text-outline'
  | 'download-outline'
  | 'ellipsis.circle.fill'
  | 'flame'
  | 'flame-outline'
  | 'flash-outline'
  | 'help-circle-outline'
  | 'hourglass-outline'
  | 'journal-outline'
  | 'list-outline'
  | 'person-outline'
  | 'play-circle'
  | 'play-outline'
  | 'refresh-outline'
  | 'settings'
  | 'sparkles-outline'
  | 'star'
  | 'sunny-outline'
  | 'swap-horizontal-outline'
  | 'time-outline'
  | 'trash-outline'
  | 'warning-outline';

type IconDefinition = {
  component: Icon;
  weight: IconWeight;
};

const ICONS: Record<AppIconName, IconDefinition> = {
  'alert-circle': { component: WarningCircleIcon, weight: 'fill' },
  'alert-circle-outline': { component: WarningCircleIcon, weight: 'regular' },
  'analytics-outline': { component: ChartBarIcon, weight: 'regular' },
  'arrow-back': { component: ArrowLeftIcon, weight: 'regular' },
  'arrow-forward': { component: ArrowRightIcon, weight: 'regular' },
  'book': { component: BookIcon, weight: 'regular' },
  'calendar-outline': { component: CalendarBlankIcon, weight: 'regular' },
  'chart.bar.fill': { component: ChartBarIcon, weight: 'fill' },
  'checkmark': { component: CheckIcon, weight: 'bold' },
  'checkmark-circle': { component: CheckCircleIcon, weight: 'fill' },
  'checkmark.circle.fill': { component: CheckCircleIcon, weight: 'fill' },
  'chevron-forward': { component: CaretRightIcon, weight: 'bold' },
  'close': { component: XIcon, weight: 'bold' },
  'close-circle': { component: XCircleIcon, weight: 'fill' },
  'document-text-outline': { component: FileTextIcon, weight: 'regular' },
  'download-outline': { component: DownloadSimpleIcon, weight: 'regular' },
  'ellipsis.circle.fill': { component: DotsThreeCircleIcon, weight: 'fill' },
  'flame': { component: FlameIcon, weight: 'fill' },
  'flame-outline': { component: FlameIcon, weight: 'regular' },
  'flash-outline': { component: LightningIcon, weight: 'regular' },
  'help-circle-outline': { component: QuestionIcon, weight: 'regular' },
  'hourglass-outline': { component: HourglassIcon, weight: 'regular' },
  'journal-outline': { component: NotebookIcon, weight: 'regular' },
  'list-outline': { component: ListBulletsIcon, weight: 'regular' },
  'person-outline': { component: UserIcon, weight: 'regular' },
  'play-circle': { component: PlayCircleIcon, weight: 'fill' },
  'play-outline': { component: PlayIcon, weight: 'fill' },
  'refresh-outline': { component: ArrowClockwiseIcon, weight: 'regular' },
  'settings': { component: GearIcon, weight: 'regular' },
  'sparkles-outline': { component: SparkleIcon, weight: 'regular' },
  'star': { component: StarIcon, weight: 'fill' },
  'sunny-outline': { component: SunIcon, weight: 'regular' },
  'swap-horizontal-outline': { component: ArrowsHorizontalIcon, weight: 'regular' },
  'time-outline': { component: ClockIcon, weight: 'regular' },
  'trash-outline': { component: TrashIcon, weight: 'regular' },
  'warning-outline': { component: WarningCircleIcon, weight: 'regular' },
};

export type AppIconProps = Omit<IconProps, 'weight'> & {
  name: AppIconName;
  weight?: IconWeight;
};

export function AppIcon({ name, weight, ...props }: AppIconProps) {
  const { component: IconComponent, weight: defaultWeight } = ICONS[name];

  return <IconComponent {...props} weight={weight ?? defaultWeight} />;
}
