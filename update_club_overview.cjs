const fs = require('fs');

let content = fs.readFileSync('src/components/ClubAdmin/ClubOverview.jsx', 'utf8');

// 1. Add recharts imports
content = content.replace(
  /import \{ (.*?) \} from 'lucide-react';/,
  `import { $1 } from 'lucide-react';\nimport { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';`
);

// 2. Remove states and functions related to "Register New Club"
content = content.replace(/const \[showClubModal.*?setLogo\('🏃‍♂️'\);/s, '');
content = content.replace(/const handleRegisterClubSubmit[\s\S]*?setPhone\(''\);\n  };\n/s, '');

// 3. Remove the button
content = content.replace(
  /<button\s+onClick=\{\(\) => setShowClubModal\(true\)\}[\s\S]*?Register New Club\s+<\/button>/,
  ''
);

// 4. Remove the modal from the return
content = content.replace(/\{\/\* Register New Club Modal \*\/\}[\s\S]*?\}\s*<\/div>\s*\);\s*\}/, `    </div>\n  );\n}`);

// 5. Add Chart Data definitions
content = content.replace(
  /return \(/,
  `const performanceData = [
    { month: 'Jan', points: 120 },
    { month: 'Feb', points: 150 },
    { month: 'Mar', points: 170 },
    { month: 'Apr', points: 210 },
    { month: 'May', points: 190 },
    { month: 'Jun', points: 280 },
    { month: 'Jul', points: 310 },
  ];
  
  const eventsData = [
    { name: 'Sprints', value: 12 },
    { name: 'Middle Dist', value: 18 },
    { name: 'Long Dist', value: 35 },
    { name: 'Field Events', value: 8 },
  ];
  const COLORS = ['#0EA5E9', '#10B981', '#F59E0B', '#8B5CF6'];

  return (`
);

// 6. Insert Charts layout right after Metrics Row
const chartsJSX = `
      {/* Analytics Charts */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '24px', marginBottom: '28px' }}>
        <div className="gov-card">
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '16px', color: 'var(--text-heading)' }}>Performance Points (YTD)</h3>
          <div style={{ height: '240px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={performanceData} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="month" stroke="#94A3B8" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#94A3B8" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                <Line type="monotone" dataKey="points" stroke="#0EA5E9" strokeWidth={3} dot={{ r: 4, fill: '#0EA5E9' }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="gov-card">
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '16px', color: 'var(--text-heading)' }}>Athlete Discipline Distribution</h3>
          <div style={{ height: '240px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={eventsData}
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent }) => \`\${name} (\${(percent * 100).toFixed(0)}%)\`}
                  labelLine={false}
                  style={{ fontSize: '0.75rem', fontWeight: 600 }}
                >
                  {eventsData.map((entry, index) => (
                    <Cell key={\`cell-\${index}\`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
`;

content = content.replace(
  /\{\/\* Action Alerts & Overview Grid \*\/\}/,
  chartsJSX + '\n      {/* Action Alerts & Overview Grid */}'
);

fs.writeFileSync('src/components/ClubAdmin/ClubOverview.jsx', content);
console.log('ClubOverview.jsx updated successfully.');
