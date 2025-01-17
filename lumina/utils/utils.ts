export function getImageUrl(tags: string[][]): string {
    const imetaTag = tags.find(tag => tag[0] === 'imeta');
    if (imetaTag) {
      const urlItem = imetaTag.find(item => item.startsWith('url '));
      if (urlItem) {
        return urlItem.split(' ')[1];
      }
    }
    return '';
  }
  