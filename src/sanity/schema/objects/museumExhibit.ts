import { defineType, defineField } from 'sanity';

export default defineType({
    name: 'museumExhibit',
    title: 'Purity Exhibit (Glass Box)',
    type: 'object',
    fields: [
        defineField({
            name: 'exhibitImage',
            title: 'Macro Photography',
            type: 'image',
            options: { hotspot: true }
        }),
        defineField({
            name: 'artifacts',
            title: 'Specimen Details',
            type: 'array',
            of: [{
                type: 'object',
                fields: [
                    defineField({ name: 'label', type: 'string', title: 'Museum Label' }),
                    defineField({ name: 'specimenData', type: 'string', title: 'Technical Spec' }) // e.g. "25 Year Age"
                ]
            }]
        })
    ]
});
