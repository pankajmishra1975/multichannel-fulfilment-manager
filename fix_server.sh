sed -i "s/addLog('warning'/addLog('warn'/g" server.ts
sed -i "s/addLog('success'/addLog('info'/g" server.ts
sed -i "s/addLog(\`Deleted \(.*\) orders locally without impacting channel resources.\`, 'SYSTEM')/addLog('info', 'system', \`Deleted \1 orders locally without impacting channel resources.\`)/g" server.ts
sed -i "s/addLog(\`Cancelled \(.*\) orders locally without impacting channel resources.\`, 'SYSTEM')/addLog('info', 'system', \`Cancelled \1 orders locally without impacting channel resources.\`)/g" server.ts
sed -i "s/addLog(\`Marked \(.*\) orders as shipped locally.\`, 'SYSTEM')/addLog('info', 'system', \`Marked \1 orders as shipped locally.\`)/g" server.ts
sed -i "s/addLog('info', 'core_system'/addLog('info', 'system'/g" server.ts
