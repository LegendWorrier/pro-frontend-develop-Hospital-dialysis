export function getStockIcon(type: string) {
    switch (type) {
      case 'med':
        return 'pills';
      case 'supply':
        return 'med-supply';
      case 'dialyzer':
        return 'dialyzer';
      case 'equipment':
        return 'equipment';
    
      default:
        break;
    }
}

export function getStockSearchStr(keyword: string) {
    if (keyword) {
      return `name = ${keyword} | code = ${keyword} | barcode = ${keyword}`;
    }
    else {
      return null;
    }
}