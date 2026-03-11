# Schemas do Sanity

Aqui estão os schemas completos e otimizados para o projeto, conectando Terapeutas e Massagens de forma relacional.

## 1. Massagista (Terapeuta)

```javascript
export default {
  name: "therapist",
  title: "Terapeuta",
  type: "document",
  fields: [
    {
      name: "name",
      title: "Nome",
      type: "string",
      validation: (rule) => rule.required(),
    },
    {
      name: "slug",
      title: "Slug (URL)",
      type: "slug",
      options: { source: "name" },
      validation: (rule) => rule.required(),
    },
    {
      name: "image",
      title: "Foto de Perfil",
      type: "image",
      options: { hotspot: true },
      validation: (rule) => rule.required(),
    },
    {
      name: "bio",
      title: "Biografia",
      type: "text",
    },
    {
      name: "specialties",
      title: "Especialidades (Massagens)",
      type: "array",
      description: "Selecione as massagens que esta terapeuta realiza",
      of: [
        {
          type: "reference",
          to: [{ type: "massage" }] 
        }
      ]
    },
    {
      name: "availability",
      title: "Datas de Atendimento",
      type: "array",
      of: [{ type: "date" }],
      options: {
        dateFormat: "DD-MM-YYYY",
        calendarTodayLabel: "Hoje"
      }
    }
  ]
}
```

## 2. Tipo de Massagem (Serviço)

```javascript
export default {
  name: "massage",
  title: "Massagem",
  type: "document",
  fields: [
    {
      name: "title",
      title: "Nome da Massagem",
      type: "string",
      validation: (rule) => rule.required(),
    },
    {
      name: "slug",
      title: "Slug (URL)",
      type: "slug",
      options: { source: "title" },
      validation: (rule) => rule.required(),
    },
    {
      name: "description",
      title: "Descrição",
      type: "text",
      rows: 4,
    },
    {
      name: "duration",
      title: "Duração (ex: 60min)",
      type: "string",
    },
    {
      name: "price",
      title: "Preço",
      type: "number",
    },
    {
      name: "image",
      title: "Imagem de Capa",
      type: "image",
      options: { hotspot: true },
    }
  ]
}
```
