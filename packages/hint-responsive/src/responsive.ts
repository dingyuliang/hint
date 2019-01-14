/**
 * @fileoverview Check responsiveness
 */

import { HintContext } from 'hint/dist/src/lib/hint-context';
// The list of types depends on the events you want to capture.
import { IHint, HintMetadata, MetadataDocsExtend } from 'hint/dist/src/lib/types';
import { StyleParse, StyleEvents } from '@hint/parser-css/dist/src/types';
import { debug as d } from 'hint/dist/src/lib/utils/debug';
import { HintScope } from 'hint/dist/src/lib/enums/hintscope';
// import { Category } from 'hint/dist/src/lib/enums/category';

const debug: debug.IDebugger = d(__filename);

/*
 * ------------------------------------------------------------------------------
 * Public
 * ------------------------------------------------------------------------------
 */


export default class ResponsiveHint implements IHint {
    private static getMetadataDocs  = function () : MetadataDocsExtend {
        return {
            categoryName: "mobile",  // categoryName will be handled first.
            description: `Check responsiveness`,
            //category: Category.other  // can't use both category and categoryName at same time.
        };
    };

    public static readonly  meta: HintMetadata = {
        docs: ResponsiveHint.getMetadataDocs(),
        id: 'responsive',
        schema: [
            /*
             * If you want to allow the user to configure your hint
             * you should use a valid JSON schema. More info in:
             * https://webhint.io/docs/contributor-guide/hints/#themetaproperty
             */
        ],
        scope: HintScope.any
    }


    public constructor(context: HintContext<StyleEvents>) {

        // Your code here.
        
        const validateCssParseEnd = async (styleParse: StyleParse) : Promise<void> => {
            // Code to validate the hint on the event when an element is visited.

            const { resource } = styleParse;
            const regexp = /(max|min)-width:\s?(([\d]+)px)/ig;
            
            debug(`Validating hint responsive`);
            
            /*
             * This is where all the magic happens. Any errors found should be
             * reported using the `context` object. E.g.:
             * await context.report(resource, 'Add error message here.');
             *
             * More information on how to develop a hint is available in:
             * https://webhint.io/docs/contributor-guide/hints/
             */

            // https://api.postcss.org/Container.html#walk
            // console.log(styleParse.ast)
            var mediaList = new Set<Number>();
            styleParse.ast.walkAtRules("media", (atRule)=>{
                let result;
                while (result = regexp.exec(atRule.params)) {
                    mediaList.add(parseInt(result[3]));
                }
            });
            if(mediaList.size > 1){
                context.report(resource, 'Congrats, You have followed the best practice for media width settings:' + Array.from(mediaList));
            }
        };

        // context.on('element::div', validateCssParseEnd);
        // As many events as you need

        // https://webhint.io/docs/user-guide/parsers/parser-css/
        // https://github.com/webhintio/hint/blob/master/packages/hint/docs/user-guide/concepts/parsers.md
        context.on("parse::end::css", validateCssParseEnd);
    }
}
