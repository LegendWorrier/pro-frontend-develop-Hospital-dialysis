import { StatusCategories } from '../enums/status-categories';
import { Data } from './data';

export interface Status extends Data {
    category: StatusCategories;
}
