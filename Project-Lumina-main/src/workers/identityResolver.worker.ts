import { read, utils } from 'xlsx';

self.onmessage = async (e) => {
  try {
    const { fileBuffer } = e.data;
    postMessage({ type: 'STATUS', payload: 'PARSING TRANSACTION SPREADSHEET...' });

    const workbook = read(fileBuffer, { type: 'array' });
    const firstSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];
    
    postMessage({ type: 'STATUS', payload: 'EXTRACTING RELATIONAL ROWS...' });
    const data = utils.sheet_to_json(worksheet);
    
    postMessage({ type: 'STATUS', payload: 'MAPPING TRANSACTIONS...' });
    
    const accounts = new Map<string, { id: string, totalSent: number, totalReceived: number }>();
    const edgesArray: any[] = [];
    
    let processed = 0;
    const total = data.length;

    const amountsSentStats = new Map<string, Map<number, number>>();
    // account -> array of transaction amounts for statistical analysis
    const accountAmountsList = new Map<string, number[]>();
    // account -> edge count
    const transactionCountStats = new Map<string, number>();
    // account -> array of timestamps for temporal velocity analysis
    const accountTimestamps = new Map<string, number[]>();
    
    // Adjacency list for cycle detection
    const adjacencyList = new Map<string, Set<string>>();

    for (const row of data as any[]) {
      const sender = String(row['Sender'] || row['SENDER'] || row['From'] || row['Source'] || row['Debitor'] || 'UNKNOWN_SENDER').trim();
      const receiver = String(row['Receiver'] || row['RECEIVER'] || row['To'] || row['Destination'] || row['Creditor'] || 'UNKNOWN_RECEIVER').trim();
      
      const amountRaw = row['Amount'] || row['AMOUNT'] || row['Value'] || row['Transaction Amount'] || 0;
      let amount = typeof amountRaw === 'number' ? amountRaw : parseFloat(String(amountRaw).replace(/[^0-9.-]+/g, ""));
      if (isNaN(amount)) amount = 0;

      // Extract timestamp
      const dateRaw = row['Date'] || row['DATE'] || row['Timestamp'] || row['Time'] || null;
      let timestamp = Date.now(); // fallback to current time if no parseable date
      if (dateRaw) {
         const parsed = Date.parse(dateRaw);
         if (!isNaN(parsed)) timestamp = parsed;
      }

      if (!accounts.has(sender)) accounts.set(sender, { id: sender, totalSent: 0, totalReceived: 0 });
      if (!accounts.has(receiver)) accounts.set(receiver, { id: receiver, totalSent: 0, totalReceived: 0 });
      
      const senderAcc = accounts.get(sender)!;
      const receiverAcc = accounts.get(receiver)!;
      
      if (sender !== 'UNKNOWN_SENDER' && receiver !== 'UNKNOWN_RECEIVER' && amount > 0) {
        senderAcc.totalSent += amount;
        receiverAcc.totalReceived += amount;
        edgesArray.push({
          source: sender,
          target: receiver,
          strength: 1,
          amount: amount,
          attribute: 'MONEY_TRANSFER'
        });

        // Track adjacency
        if (!adjacencyList.has(sender)) adjacencyList.set(sender, new Set());
        adjacencyList.get(sender)!.add(receiver);

        // Track frequent same amounts
        if (!amountsSentStats.has(sender)) amountsSentStats.set(sender, new Map());
        const senderAmountsMap = amountsSentStats.get(sender)!;
        senderAmountsMap.set(amount, (senderAmountsMap.get(amount) || 0) + 1);

        if (!accountAmountsList.has(sender)) accountAmountsList.set(sender, []);
        accountAmountsList.get(sender)!.push(amount);

        if (!accountTimestamps.has(sender)) accountTimestamps.set(sender, []);
        accountTimestamps.get(sender)!.push(timestamp);

        // Track frequency
        transactionCountStats.set(sender, (transactionCountStats.get(sender) || 0) + 1);
        transactionCountStats.set(receiver, (transactionCountStats.get(receiver) || 0) + 1);
      }

      processed++;
      if (processed % 5000 === 0) {
         postMessage({ type: 'PROGRESS', payload: { processed, total } });
      }
    }
    
    postMessage({ type: 'STATUS', payload: 'DETECTING BEHAVIORAL PATTERNS...' });

    // Detect loops (depth limit to 5 efficiently)
    const isInCircularLoop = new Set<string>();
    for (const [node, targets] of adjacencyList.entries()) {
      // Find paths using simple iterative BFS up to depth 4 looking for cycle back to node
      let foundCycle = false;
      let queue: { current: string, depth: number }[] = [{ current: node, depth: 0 }];
      let qIndex = 0;
      const visited = new Set<string>();
      
      while (qIndex < queue.length && !foundCycle) {
        const { current, depth } = queue[qIndex++];
        if (depth > 4) continue;
        
        const neighbors = adjacencyList.get(current);
        if (!neighbors) continue;

        for (const neighbor of neighbors) {
          if (neighbor === node && depth >= 1) { // depth >=1 means at least 2 edges (A->B->A or A->B->C->A)
            foundCycle = true;
            break;
          }
          if (!visited.has(neighbor)) {
            visited.add(neighbor);
            queue.push({ current: neighbor, depth: depth + 1 });
          }
        }
      }

      if (foundCycle) {
        isInCircularLoop.add(node);
      }
    }

    postMessage({ type: 'STATUS', payload: 'CALCULATING RISK EXPOSURE...' });
    
    let activeClusters = 0;
    let highRiskUsersCount = 0;
    
    // Parent components clustering
    const parent = new Map<string, string>();
    const __find = (i: string): string => {
      if (parent.get(i) === i || !parent.has(i)) return i;
      const p = __find(parent.get(i)!);
      parent.set(i, p);
      return p;
    };
    const __union = (i: string, j: string) => {
      const rootI = __find(i);
      const rootJ = __find(j);
      if (rootI !== rootJ) parent.set(rootI, rootJ);
    };
    
    for (const [id] of accounts) parent.set(id, id);
    for (const edge of edgesArray) {
      if (edge.source !== edge.target) __union(edge.source, edge.target);
    }
    const clusters = new Map<string, string[]>();
    for (const [id] of accounts) {
      const root = __find(id);
      if (!clusters.has(root)) clusters.set(root, []);
      clusters.get(root)!.push(id);
    }
    for (const arr of clusters.values()) {
       if (arr.length > 2) activeClusters++; 
    }

    const finalNodes = Array.from(accounts.values()).map(acc => {
      const clusterId = __find(acc.id);
      
      let riskScore = 0;
      const reasons: string[] = [];
      const flags: string[] = [];

      // Flag 1: Circular Loop Detection (+60)
      if (isInCircularLoop.has(acc.id)) {
        riskScore += 60;
        reasons.push("Circular transaction loop");
        flags.push("Layering");
      }

      // Flag 2: Anomalous amount values (Standard Deviation / Z-Score +35)
      const amountsList = accountAmountsList.get(acc.id) || [];
      if (amountsList.length >= 4) {
        const mean = amountsList.reduce((a, b) => a + b, 0) / amountsList.length;
        const variance = amountsList.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / amountsList.length;
        const stdDev = Math.sqrt(Math.max(variance, 1));
        
        let hasZScoreOutlier = false;
        amountsList.forEach(amt => {
          const zScore = Math.abs((amt - mean) / stdDev);
          if (zScore > 2.5) hasZScoreOutlier = true; // High standard deviation outlier
        });

        if (hasZScoreOutlier) {
           riskScore += 35;
           reasons.push("Statistical anomaly detected");
           flags.push("Anomaly");
        }
      }

      // Check original exact same value logic (+20 instead of +30 to distribute)
      const amountMap = amountsSentStats.get(acc.id);
      let sameValueRepetitions = false;
      if (amountMap) {
        for (const [amt, occurrences] of amountMap.entries()) {
          if (occurrences >= 3) {
            sameValueRepetitions = true;
            break;
          }
        }
      }
      if (sameValueRepetitions) {
        riskScore += 20;
        reasons.push("Repeated identical transactions");
        flags.push("Structuring");
      }

      // Flag 3: Temporal Velocity Spike (+40)
      const timestamps = accountTimestamps.get(acc.id) || [];
      if (timestamps.length >= 3) {
        const sorted = [...timestamps].sort((a,b) => a - b);
        let anomalyDetected = false;
        // Look for 3 transactions within 2 hours (2 * 60 * 60 * 1000)
        const THRESHOLD_WINDOW = 2 * 60 * 60 * 1000; 
        for (let i = 0; i <= sorted.length - 3; i++) {
          if (sorted[i+2] - sorted[i] <= THRESHOLD_WINDOW) {
             anomalyDetected = true;
             break;
          }
        }
        if (anomalyDetected) {
           riskScore += 40;
           reasons.push("High transaction velocity");
           flags.push("Velocity Abuse");
        }
      } else {
        // Fallback Frequency logic if dates are weird (+30)
        const totalFreq = transactionCountStats.get(acc.id) || 0;
        if (totalFreq >= 8) {
          riskScore += 30;
          reasons.push("High baseline transaction frequency");
        }
      }

      // Flag 4: Benign Pattern Deduction (-35)
      // If they only ever send to a single distinct receiver and aren't in a loop, it's typically a utility/wallet recharge.
      const uniqueReceivers = adjacencyList.get(acc.id)?.size || 0;
      if (uniqueReceivers === 1 && !isInCircularLoop.has(acc.id) && acc.totalSent > 0) {
        riskScore = Math.max(0, riskScore - 35);
        reasons.push("Benign repetitive behavior");
      }
      
      let riskLevel: 'High' | 'Medium' | 'Low' = 'Low';
      if (riskScore >= 70) {
        riskLevel = 'High';
        highRiskUsersCount++;
      } else if (riskScore >= 40) {
        riskLevel = 'Medium';
        highRiskUsersCount++; // Also count medium as flagged
      }

      return {
        id: acc.id,
        cluster: clusterId,
        isSuspicious: riskLevel === 'High' || riskLevel === 'Medium', // Maintain backwards compat flag
        totalSent: acc.totalSent,
        totalReceived: acc.totalReceived,
        riskScore,
        riskLevel,
        riskReasons: reasons,
        flags
      };
    });

    const payload = {
      nodes: finalNodes,
      edges: edgesArray,
      clusterCount: activeClusters,
      totalNodes: accounts.size,
      totalTransactions: edgesArray.length,
      highRiskUsersCount
    };
    
    postMessage({ type: 'COMPLETE', payload });
  } catch (error) {
    postMessage({ type: 'ERROR', payload: String(error) });
  }
};
