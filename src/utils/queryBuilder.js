/**
 * Dynamic SQL query builder.
 */
class QueryBuilder {
  constructor(base) { this.query=base; this.conditions=[]; this.values=[]; this.idx=1; }
  where(col,val,op='=') { if(val==null) return this; this.conditions.push(`${col} ${op} $${this.idx}`); this.values.push(val); this.idx++; return this; }
  whereBetween(col,min,max) { if(min) this.where(col,min,'>='); if(max) this.where(col,max,'<='); return this; }
  orderBy(col,dir='DESC') { this.order=`ORDER BY ${col} ${dir}`; return this; }
  limit(l,o) { this.lim=`LIMIT $${this.idx} OFFSET $${this.idx+1}`; this.values.push(l,o); this.idx+=2; return this; }
  build() { let s=this.query; if(this.conditions.length) s+=' WHERE '+this.conditions.join(' AND '); if(this.order) s+=' '+this.order; if(this.lim) s+=' '+this.lim; return {sql:s,values:this.values}; }
}
module.exports = QueryBuilder;
