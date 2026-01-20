import { productSchema } from "./product";
import { exhibitSchema } from "./exhibit";
import { journalSchema } from "./journal";
import shoppableImage from "./objects/shoppableImage";
import museumExhibit from "./objects/museumExhibit";
import { fieldReportSchema } from "./objects/fieldReport";

import { fieldJournalSchema } from "./fieldJournal";

export const schemaTypes = [productSchema, exhibitSchema, journalSchema, shoppableImage, museumExhibit, fieldReportSchema, fieldJournalSchema];
