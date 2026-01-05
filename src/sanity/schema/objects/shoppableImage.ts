import { defineType, defineField } from 'sanity';

export default defineType({
    name: 'shoppableImage',
    title: 'Field Report',
    type: 'object',
    fields: [
        defineField({
            name: 'image',
            type: 'image',
            options: { hotspot: true }
        }),
        defineField({
            name: 'hotspots',
            title: 'Product Tags',
            type: 'array',
            of: [
                {
                    type: 'object',
                    fields: [
                        defineField({ name: 'x', type: 'number', title: 'X %' }),
                        defineField({ name: 'y', type: 'number', title: 'Y %' }),
                        defineField({ name: 'annotation', type: 'string', title: 'Note' }),
                        defineField({ name: 'product', type: 'reference', to: [{ type: 'product' }] })
                    ]
                }
            ]
        })
    ]
});
