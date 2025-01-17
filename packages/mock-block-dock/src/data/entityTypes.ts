import { BlockProtocolEntityType } from "blockprotocol";

export const entityTypes: BlockProtocolEntityType[] = [
  {
    $id: "https://example.com/types/Company",
    title: "Company",
    entityTypeId: "Company",
    type: "object",
    $schema: "https://json-schema.org/draft/2019-09/schema",
    description: "A company or organisation.",
    properties: {
      employees: {
        type: "number",
        description: "The number of employees in the company.",
      },
      name: {
        type: "string",
        description: "A display name for the company.",
      },
    },
    required: ["name", "employees"],
  },
  {
    $id: "https://example.com/types/Person",
    title: "Person",
    entityTypeId: "Person",
    type: "object",
    $schema: "https://json-schema.org/draft/2019-09/schema",
    description: "A human person.",
    properties: {
      age: {
        type: "number",
        description: "The age of the person, in years.",
      },
      email: {
        type: "string",
        description: "An email address.",
        format: "email",
      },
      name: {
        type: "string",
        description: "The person's name.",
      },
      username: {
        description: "The person's username in this application",
        type: "string",
        minLength: 4,
        maxLength: 24,
      },
    },
    required: ["age", "email", "name", "username"],
  },
];
