import { productSchema } from "./product";
import { exhibitSchema } from "./exhibit";
import { journalSchema } from "./journal";
import shoppableImage from "./objects/shoppableImage";
import museumExhibit from "./objects/museumExhibit";

import { fieldJournalSchema } from "./fieldJournal";

export const schemaTypes = [productSchema, exhibitSchema, journalSchema, shoppableImage, museumExhibit, fieldJournalSchema];
