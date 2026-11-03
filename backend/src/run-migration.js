// Keep a migration's transaction and temporary tables on one MySQL connection.
export async function executeMigration(db,sql){
 const connection=await db.getConnection();
 try{for(const statement of sql.split(';').map(s=>s.trim()).filter(Boolean))await connection.query(statement);}
 catch(error){await connection.rollback().catch(()=>{});throw error;}
 finally{connection.release();}
}
