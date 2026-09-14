<template>
  <div class="table-wrap">
    <table>
      <thead>
        <tr>
          <th v-for="column in columns" :key="column.key" :style="column.width ? { width: column.width } : undefined">
            {{ column.label }}
          </th>
          <th v-if="$slots.actions" class="actions-col">Ações</th>
        </tr>
      </thead>
      <tbody>
        <tr v-if="!rows.length">
          <td :colspan="columns.length + ($slots.actions ? 1 : 0)" class="empty">
            <slot name="empty">Nenhum registro encontrado.</slot>
          </td>
        </tr>
        <tr v-for="(row, index) in rows" :key="rowKeyOf(row, index)">
          <td v-for="column in columns" :key="column.key">
            <slot :name="`cell-${column.key}`" :row="row">
              {{ cellValue(row, column.key) }}
            </slot>
          </td>
          <td v-if="$slots.actions" class="actions-col">
            <slot name="actions" :row="row" />
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
export interface DsTableColumn {
  key: string
  label: string
  width?: string
}

const props = withDefaults(
  defineProps<{
    columns: DsTableColumn[]
    rows: unknown[]
    rowKey?: string
  }>(),
  { rowKey: 'id' },
)

function asRecord(row: unknown): Record<string, unknown> {
  return row && typeof row === 'object' ? (row as Record<string, unknown>) : {}
}

function rowKeyOf(row: unknown, index: number) {
  const value = asRecord(row)[props.rowKey]
  return value == null ? String(index) : String(value)
}

function cellValue(row: unknown, key: string) {
  const value = asRecord(row)[key]
  if (Array.isArray(value)) return value.join(', ')
  return value == null ? '' : String(value)
}
</script>

<style scoped>
.table-wrap {
  overflow: auto;
  border: 1px solid var(--ds-border);
  border-radius: var(--ds-radius-lg);
  background: rgba(8, 12, 28, 0.55);
}

table {
  width: 100%;
  border-collapse: collapse;
  min-width: 680px;
}

th,
td {
  padding: 0.9rem 1rem;
  text-align: left;
  border-bottom: 1px solid var(--ds-border);
  font-size: var(--ds-fs-sm);
}

th {
  color: var(--ds-text-muted);
  font-weight: 700;
  letter-spacing: 0.03em;
  text-transform: uppercase;
  font-size: var(--ds-fs-xs);
}

tr:hover td {
  background: rgba(129, 140, 248, 0.06);
}

.empty {
  text-align: center;
  color: var(--ds-text-muted);
  padding: 2.5rem 1rem;
}

.actions-col {
  white-space: nowrap;
}
</style>
