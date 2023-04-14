import { SearchSetting } from '.';

export interface SearchData {
  criteria?: string;
  setting?: SearchSetting;
  currentPage?: number;
  totalPages?: number;
}
