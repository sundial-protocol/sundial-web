import eternlIcon from '@/public/eternl.png';
import flintIcon from '@/public/flint.svg';
import geroIcon from '@/public/gero.png';
import laceIcon from '@/public/lace.svg';
import namiIcon from '@/public/nami.svg';
import nufiIcon from '@/public/nufi.svg';
import typhonIcon from '@/public/typhon.svg';
import yoroiIcon from '@/public/yoroi.png';

export const chromeStoreUrl = 'https://chrome.google.com/webstore/detail/';

export const knownWalletExtensions = {
  nami: {
    id: 'lpfcbjknijpeeillifnkikgncikgfhdo',
    display: 'Nami',
    icon: namiIcon,
  },
  flint: {
    id: 'hnhobjmcibchnmglfbldbfabcgaknlkj',
    display: 'Flint',
    icon: flintIcon,
  },
  typhoncip30: {
    id: 'kfdniefadaanbjodldohaedphafoffoh',
    display: 'Typhon',
    icon: typhonIcon,
  },
  yoroi: {
    id: 'ffnbelfdoeiohenkjibnmadjiehjhajb',
    display: 'Yoroi',
    icon: yoroiIcon,
  },
  eternl: {
    id: 'kmhcihpebfmpgmihbkipmjlmmioameka',
    display: 'Eternl',
    icon: eternlIcon,
  },
  gerowallet: {
    id: 'bgpipimickeadkjlklgciifhnalhdjhe',
    display: 'GeroWallet',
    icon: geroIcon,
  },
  nufi: {
    id: 'gpnihlnnodeiiaakbikldcihojploeca',
    display: 'NuFi',
    icon: nufiIcon,
  },
  lace: {
    id: 'gafhhkghbfjjkeiendhlofajokpaflmk',
    display: 'Lace',
    icon: laceIcon,
  },
};

export type KnownWalletName = keyof typeof knownWalletExtensions;

export function getWalletIcon(wallet: string) {
  if (wallet === '') {
    return;
  }
  if (
    typeof window === 'undefined' ||
    typeof window.cardano === 'undefined' ||
    typeof window.cardano[wallet] === 'undefined'
  ) {
    return knownWalletExtensions[wallet as KnownWalletName]?.icon;
  }

  return window.cardano[wallet].icon;
}

export function getWalletDisplayName(wallet: string) {
  if (wallet === '') {
    return;
  }
  const knownName = knownWalletExtensions[wallet as KnownWalletName]?.display;

  if (knownName) {
    return knownName;
  } else if (
    typeof window === 'undefined' ||
    typeof window.cardano === 'undefined' ||
    typeof window.cardano[wallet] === 'undefined'
  ) {
    return 'Wallet';
  }

  return window.cardano[wallet].name;
}
