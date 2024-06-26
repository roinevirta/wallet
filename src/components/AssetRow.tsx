import React from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { FadeIn } from 'react-native-reanimated';

import { useTokenBalanceConvertedToAppCurrency } from '@/hooks/useAppCurrencyValue';
import { WalletType } from '@/onChain/wallets/registry';
import { useAppCurrency } from '@/realm/settings/useAppCurrency';
import { useRealmWalletById } from '@/realm/wallets';
import { getWalletName } from '@/utils/getWalletName';

import { GradientItemBackground } from './GradientItemBackground';
import { Label } from './Label';
import { TokenIcon } from './TokenIcon';
import { Touchable } from './Touchable';

import { formatAppCurrencyValue, tokenAmountShortenedDisplay } from '/modules/text-utils';

type CommonAssetProps = {
  assetId: string;
  balance: string;
  metadata: {
    label: string;
    symbol: string;
    decimals: number;
  };
};

export type AssetRowProps = {
  token: CommonAssetProps;
  options?: Partial<{
    hideZeroAmount: boolean;
    isRemoteAsset: boolean;
    networkName: WalletType;
    onPress: () => void;
    showAmountInFiat: boolean;
    style: StyleProp<ViewStyle>;
    selected: boolean;
    symbolUnderLabel: boolean;
    tag: JSX.Element;
    testID: string;
    walletId: string;
    readonly?: boolean;
  }>;
};

export const AssetRow = ({ token, options = {} }: AssetRowProps) => {
  const { hideZeroAmount, networkName, showAmountInFiat, onPress, style, symbolUnderLabel, tag, testID, walletId, selected } = options;
  const wallet = useRealmWalletById(walletId);
  const isNative = token.assetId.includes('slip44:');
  const label = wallet && wallet.nativeTokenLabel && isNative ? getWalletName(wallet.nativeTokenLabel.toLowerCase() as WalletType) : token.metadata.label;
  const amountShortened = tokenAmountShortenedDisplay(token);
  const amount = hideZeroAmount && amountShortened === '0' ? '' : `${amountShortened}${symbolUnderLabel ? '' : ' ' + token.metadata.symbol}`;

  const content = (
    <>
      <View style={styles.leftContentContainer}>
        {(wallet || networkName !== undefined) && (
          <TokenIcon wallet={wallet} tokenId={token.assetId} tokenSymbol={token.metadata.symbol} networkName={networkName} />
        )}
        <View style={styles.labelAndLabelContainer}>
          <View style={styles.labelContainer}>
            <Label type="boldTitle2" style={styles.label} numberOfLines={1}>
              {label}
            </Label>
            {tag !== null && <View>{tag}</View>}
          </View>
          {symbolUnderLabel && (
            <Label type="regularMonospace" color="light75">
              {token.metadata.symbol}
            </Label>
          )}
        </View>
      </View>
      <View style={styles.rightContentContainer}>
        {showAmountInFiat && <AssetRowAmountInFiat token={token} />}
        {}
        <Label
          type={symbolUnderLabel ? 'boldMonospace' : 'regularMonospace'}
          color={symbolUnderLabel ? 'light100' : 'light50'}
          style={[styles.amount, symbolUnderLabel && { fontSize: 15 }]}
          numberOfLines={1}
          ellipsizeMode="tail">
          {amount}
        </Label>
      </View>
    </>
  );

  const containerStyle = [style, styles.container];

  if (onPress) {
    return (
      <Touchable disabled={options.readonly} onPress={onPress} style={containerStyle} accessibilityLabel="CoinRowLabel" testID={testID}>
        {selected && <GradientItemBackground backgroundType="modal" />}
        {content}
      </Touchable>
    );
  } else {
    return (
      <View style={containerStyle} testID={testID}>
        {content}
      </View>
    );
  }
};

const AssetRowAmountInFiat = ({ token }: Pick<AssetRowProps, 'token'>) => {
  const amountInAppCurrency = useTokenBalanceConvertedToAppCurrency(token);

  const { currency } = useAppCurrency();

  return (
    <Label entering={FadeIn} style={styles.animatedNumbers} type="boldLargeMonospace">
      {formatAppCurrencyValue(amountInAppCurrency, currency, true, false)}
    </Label>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'nowrap',
    height: 52,
    justifyContent: 'space-between',
    overflow: 'hidden',
    paddingVertical: 6,
  },
  leftContentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 1,
  },
  rightContentContainer: {
    paddingLeft: 10,
  },
  labelAndLabelContainer: {
    marginLeft: 12,
    flexShrink: 1,
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'nowrap',
  },
  label: {
    marginRight: 8,
  },
  amountInFiat: {
    alignItems: 'flex-end',
  },
  animatedNumbers: {
    alignItems: 'flex-end',
    textAlign: 'right',
    minWidth: 100,
  },
  amount: {
    textAlign: 'right',
    marginTop: 4,
  },
});
