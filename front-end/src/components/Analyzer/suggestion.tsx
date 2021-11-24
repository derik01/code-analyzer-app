import { Diagnostic } from "../../lib/LinterAnalysis";

export type SuggestionEnumeration = {
    invMap: { [diagnosticId : string]: number };
    enum: [string, string][];
    indexOf: (fileId : string) => number;
    suggestionOf: (idx : number) => [string, string];
};


export type SuggestionControl = {
    closeSuggestionCallback: (suggest : string) => () => void;
    openSuggestionCallback: (suggest : string) => () => void;
    selectedSuggest : string | null;
};


export type AnnotatedDiagnostic = 
    [charnum: number, diagnostics: Diagnostic];

export type LineMap = {
  [linenum : number]: AnnotatedDiagnostic[] | undefined;
};
