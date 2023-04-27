export type AuditWidgetData = {
    date: string
    audit_type: string
    details: string
}

export type AuditWidgetSchema = {
    data?: AuditWidgetData[]
    is_loading: boolean
}
