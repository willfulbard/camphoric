import React from 'react';
import CustomDescriptionField from '../fields/Description';

/**
 * Modified version of DefaultObjectFieldTemplate from react-jsonschema-form:
 * - wrap properties in a div which can be assigned classes via
 *   'contentClassNames' in uiSchema
 * - don't bother with 'expandable' option
 *
 * See https://react-jsonschema-form.readthedocs.io/en/latest/advanced-customization/#object-field-template
 */
export default function ObjectFieldTemplate(props: any) {
  const { TitleField } = props;
  return (
    <fieldset id={props.idSchema.$id}>
      {(props.uiSchema["ui:title"] || props.title) && (
        <TitleField
          id={`${props.idSchema.$id}__title`}
          title={props.title || props.uiSchema["ui:title"]}
          required={props.required}
          formContext={props.formContext}
        />
      )}
      {props.description && (
        <CustomDescriptionField
          id={`${props.idSchema.$id}__description`}
          description={props.description}
        />
      )}
      <div className={props.uiSchema.contentClassNames || "content"}>
          {props.properties.map((prop: any) => prop.content)}
      </div>
    </fieldset>
  );
}
