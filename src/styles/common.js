import { StyleSheet } from 'react-native';
import { colors, spacing, borderRadius, typography, shadows } from './themes';

export const commonStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.gray100,
  },
  screenContainer: {
    flex: 1,
    backgroundColor: colors.gray100,
    padding: spacing.md,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
    ...shadows.sm,
  },
  cardElevated: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
    ...shadows.md,
  },
  button: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: colors.white,
    fontSize: typography.body.fontSize,
    fontWeight: '600',
  },
  buttonOutline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.primary,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonOutlineText: {
    color: colors.primary,
    fontSize: typography.body.fontSize,
    fontWeight: '600',
  },
  input: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.gray300,
    borderRadius: borderRadius.md,
    padding: spacing.sm,
    fontSize: typography.body.fontSize,
    color: colors.gray800,
  },
  inputFocused: {
    borderColor: colors.primary,
  },
  label: {
    fontSize: typography.bodySmall.fontSize,
    fontWeight: '600',
    color: colors.gray700,
    marginBottom: spacing.xs,
  },
  errorText: {
    fontSize: typography.caption.fontSize,
    color: colors.danger,
    marginTop: spacing.xs,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.gray800,
    marginBottom: spacing.md,
  },
  divider: {
    height: 1,
    backgroundColor: colors.gray300,
    marginVertical: spacing.md,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  flex1: {
    flex: 1,
  },
  textCenter: {
    textAlign: 'center',
  },
  textRight: {
    textAlign: 'right',
  },
  mbSm: {
    marginBottom: spacing.sm,
  },
  mbMd: {
    marginBottom: spacing.md,
  },
  mbLg: {
    marginBottom: spacing.lg,
  },
  mtSm: {
    marginTop: spacing.sm,
  },
  mtMd: {
    marginTop: spacing.md,
  },
  mtLg: {
    marginTop: spacing.lg,
  },
  pSm: {
    padding: spacing.sm,
  },
  pMd: {
    padding: spacing.md,
  },
  pLg: {
    padding: spacing.lg,
  },
});

export default commonStyles;