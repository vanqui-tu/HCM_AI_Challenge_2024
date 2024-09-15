import { ImageCardModel } from "@components/ImageCard/types";

export type SearchValue = {
  text?: string;
  location?: string;
  audio?: string;
  dateRange?: {
    from?: string;
    to?: string;
  };
};

export type SearchEngineProps = {
  search: SearchValue;
  setSearch: (value: SearchValue) => void;
  setImageCards: (items: ImageCardModel[]) => void;
  setLoadingItems: (loading: boolean) => void;
  hasSearched: boolean;
  setHasSearched: (hasSearched: boolean) => void;
  handleFormSubmit: () => Promise<void>;
};
