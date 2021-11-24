import { SuggestionEnumeration } from './suggestion';
import { SourceMap } from '../../lib/LinterAnalysis';

const enumerateSuggestions = (sourceMap : SourceMap) => {
  const suggestions : [string, string][] = [];
  const suggestionEnumeration : { [fileId : string]: number } = {};
  
  if(sourceMap !== undefined) {
    for(let [fileId, sourceFile] of Object.entries(sourceMap!)) {
      if(sourceFile.Diagnostics) {
        for(let { DiagnosticId } of sourceFile.Diagnostics!) {
          suggestionEnumeration[DiagnosticId] = suggestions.length; 
          suggestions.push([fileId, DiagnosticId]);
        }
      }
    }
  }

  return {
    invMap: suggestionEnumeration,
    enum: suggestions,
    indexOf: (fileId : string) => suggestionEnumeration[fileId],
    suggestionOf: (idx : number) => suggestions[idx],
  } as SuggestionEnumeration;
}

export default enumerateSuggestions;