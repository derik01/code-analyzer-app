
import React, { FC } from 'react';

import { Diagnostic } from "../../../lib/LinterAnalysis";

import CodeSuggestion from '../CodeSuggestion';
import {
    SuggestionControl,
    SuggestionEnumeration,
    LineMap,
    AnnotatedDiagnostic
} from "../suggestion";

const IndirectRenderer = (
    diagnostics : Diagnostic[],
    control : SuggestionControl,
    enumerated : SuggestionEnumeration
) => {
        const lineMap : LineMap = {};
        const eofSuggestions : Diagnostic[] = [];

        if(diagnostics) {
            for(let diagnostic of diagnostics!) {
            const [linenum, charnum] = diagnostic.DiagnosticMessage.Location;

            if(lineMap[linenum] === undefined)
                lineMap[linenum] = [[charnum, diagnostic]];
            else
                lineMap[linenum]!.push([charnum, diagnostic]);

            if(diagnostic.DiagnosticMessage.EOF)
                eofSuggestions.push(diagnostic);
            }
        }

        const CodeTag : FC = ({children, ...props}) => {

            const postRendered = React.Children.map(children, (codeSegment, i) => {

            if(codeSegment === null || codeSegment === undefined) {
                return codeSegment;
            }

            const _lineDiagnostics = lineMap[i];

            if(_lineDiagnostics === undefined) {
                return codeSegment;
            }

            const lineDiagnostics = _lineDiagnostics.sort(
                ([charA, _a], [charB, _b]) => charA - charB
            ) as AnnotatedDiagnostic[];

            let offset = 0;
            let diagIdx = 0;

            const n_tags = React.Children.count(codeSegment.props.children);

            const annotatedSegments = React.Children.map(codeSegment.props.children, function(codeTag, i) {
                if (i === 0 || diagIdx >= lineDiagnostics.length || codeTag === undefined || codeTag == null) {
                    return codeTag;
                }

                let textContent = "";
                if (typeof(codeTag) === "string") {
                    textContent = codeTag;
                } else {
                    const n_children = React.Children.count(codeTag.props.children);

                    if(n_children !== 1) {
                        console.error("Expected one child");
                        return codeTag;
                    }

                    textContent = codeTag.props.children[0];
                }

                let wrapped = codeTag;
                let layers = 0;
                while(diagIdx < lineDiagnostics.length && textContent.length + offset > lineDiagnostics[diagIdx][0]) {
                    let endStyle = {};

                    if(i === n_tags - 1) {
                        endStyle = {
                        minWidth: 10
                        };
                    }

                    const diagnostic = lineDiagnostics[diagIdx][1];
                    
                    let _controls = control;

                    if(layers > 0) {
                        _controls = {
                        ...control,
                        openSuggestionCallback: (suggest) => () => {},
                        }
                    }
                    
                    wrapped = (
                        <CodeSuggestion
                        Diagnostic={diagnostic}
                        control={_controls}
                        enumerated={enumerated}
                        >
                        <div
                            style={{
                            border: '1px solid #657b83',
                            borderRadius: '3px',
                            ...endStyle
                            }}
                        >
                            {wrapped}
                        </div>
                        </CodeSuggestion>
                    );

                    layers++;
                    diagIdx++;
                }

                offset += textContent.length;

                return wrapped;
            });

            return React.cloneElement(codeSegment, [], annotatedSegments);
        });

        let eofSuggestion = null;
        for(let diagnostic of eofSuggestions) {
        if(eofSuggestion === null) {
            eofSuggestion = <div style={{
            minWidth: 10
            }} />
        }

        eofSuggestion = (
            <CodeSuggestion
            Diagnostic={diagnostic}
            control={control}
            enumerated={enumerated}
            >
            {eofSuggestion}
            </CodeSuggestion>
        );
        }

        if(eofSuggestions !== null) {
            postRendered?.push(eofSuggestion!);
        }

        return (
            <code
            {...props}
            >
                {postRendered}
            </code>
        );
    };

    return CodeTag;
};

export default IndirectRenderer;