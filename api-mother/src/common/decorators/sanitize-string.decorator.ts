import { Transform, TransformFnParams } from 'class-transformer';
import { filterXSS, IFilterXSSOptions } from 'xss'; // Corrected import and type

/**
 * Custom decorator to sanitize string properties using the 'xss' library.
 * This decorator should be applied to DTO properties to prevent XSS attacks.
 *
 * @param options Optional configuration options for the xss filter.
 * @returns A PropertyDecorator that applies XSS sanitization during transformation.
 */
export function SanitizeString(options?: IFilterXSSOptions): PropertyDecorator {
  return Transform((params: TransformFnParams) => {
    if (typeof params.value === 'string') {
      return filterXSS(params.value, options);
    }
    return params.value;
  });
}
