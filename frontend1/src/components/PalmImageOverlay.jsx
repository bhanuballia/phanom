import React from 'react';

export default function PalmImageOverlay({ imageUrl, reading, activeItem }) {
    if (!imageUrl) return null;

    const lines = reading?.lines || [];
    const mounts = reading?.mounts || [];

    // Helper to map [y, x] to percentages
    const toPctX = (pt) => (pt[1] / 1000) * 100;
    const toPctY = (pt) => (pt[0] / 1000) * 100;

    const getMountColor = (name) => {
        const n = name.toLowerCase();
        if (n.includes("jupiter")) return "#facc15"; // yellow
        if (n.includes("mercury")) return "#22c55e"; // green
        if (n.includes("sun")) return "#ef4444"; // red
        if (n.includes("venus")) return "#ec4899"; // pink
        if (n.includes("saturn")) return "#334155"; // slate
        if (n.includes("moon")) return "#e2e8f0"; // slate-200
        return "#eab308"; // default yellow
    };

    const getLineColor = (name, idx) => {
        const n = name.toLowerCase();
        if (n.includes("life")) return "#ef4444"; // red
        if (n.includes("heart")) return "#3b82f6"; // blue
        if (n.includes("head")) return "#22c55e"; // green
        if (n.includes("fate")) return "#8b5cf6"; // purple
        const colors = ["#ef4444", "#3b82f6", "#22c55e", "#a855f7"];
        return colors[idx % colors.length];
    };

    return (
        <div className="relative w-full overflow-hidden rounded-xl border border-slate-700 bg-slate-800 shadow-2xl group">
            <img 
                src={imageUrl} 
                alt="Palm Analysis" 
                className="w-full h-auto block object-contain"
            />
            {reading && (
            <svg 
                className="absolute top-0 left-0 w-full h-full pointer-events-none" 
                viewBox="0 0 100 100" 
                preserveAspectRatio="none"
            >
                {/* Draw Mounts as plain text */}
                {mounts.map((mount, idx) => {
                    const box = mount.bounding_box;
                    if (!box || box.length !== 4) return null;
                    const [ymin, xmin, ymax, xmax] = box;
                    
                    const x = ((xmin + xmax) / 2 / 1000) * 100;
                    const y = ((ymin + ymax) / 2 / 1000) * 100;

                    const isActive = activeItem === mount.name;

                    // Translate to Hindi
                    const hindiMountMap = {
                        "Mount of Jupiter": "गुरु",
                        "Mount of Venus": "शुक्र",
                        "Mount of Saturn": "शनि",
                        "Mount of Sun": "सूर्य",
                        "Mount of Mercury": "बुध",
                        "Mount of Moon": "चन्द्र",
                        "Mount of Mars": "मंगल",
                        "Mount of Rahu": "राहु",
                        "Mount of Ketu": "केतु"
                    };
                    const label = hindiMountMap[mount.name] || mount.name.replace('Mount of ', '');

                    return (
                        <g key={`mount-${idx}`} className={`transition-all duration-300 ${isActive || !activeItem ? 'opacity-100' : 'opacity-40'}`}>
                            {/* Simple text label to match the diagram style */}
                            <text 
                                x={x} 
                                y={y} 
                                fontSize={isActive ? "3.5" : "2.5"} 
                                stroke="#ffffff"
                                strokeWidth="0.5"
                                strokeLinejoin="round"
                                textAnchor="middle"
                                fontWeight="600"
                                className="transition-all duration-300"
                            >
                                {label}
                            </text>
                            <text 
                                x={x} 
                                y={y} 
                                fontSize={isActive ? "3.5" : "2.5"} 
                                fill="#000000" 
                                textAnchor="middle"
                                fontWeight="600"
                                className="transition-all duration-300"
                            >
                                {label}
                            </text>
                        </g>
                    );
                })}

                {/* Draw Lines as solid strokes */}
                {lines.map((line, idx) => {
                    const points = line.points;
                    let pts = points;
                    if (!pts || pts.length === 0) {
                        if (line.start_point && line.end_point) {
                            pts = [line.start_point, line.end_point];
                        } else {
                            return null;
                        }
                    }

                    const isActive = activeItem === line.name;

                    // Translate to Hindi
                    const hindiLineMap = {
                        "Life Line": "आयुष्य रेखा",
                        "Heart Line": "अंतरकरण रेखा",
                        "Head Line": "मस्तक रेखा",
                        "Fate Line (Bhagya Rekha)": "भाग्य रेखा",
                        "Sun Line": "सूर्य रेखा",
                        "Marriage Line": "विवाह",
                        "Children Line": "संतान रेखा",
                        "Manibandh Rekha 1": "मणिबंध रेखा १",
                        "Manibandh Rekha 2": "मणिबंध रेखा २",
                        "Manibandh Rekha 3": "मणिबंध रेखा ३"
                    };
                    const label = hindiLineMap[line.name] || line.name.split(' (')[0];

                    // Map to percentages
                    const mappedPts = pts.map(p => [toPctX(p), toPctY(p)]);
                    
                    let d = `M ${mappedPts[0][0]} ${mappedPts[0][1]}`;
                    if (mappedPts.length === 4) {
                        d += ` C ${mappedPts[1][0]} ${mappedPts[1][1]}, ${mappedPts[2][0]} ${mappedPts[2][1]}, ${mappedPts[3][0]} ${mappedPts[3][1]}`;
                    } else {
                        for (let i = 1; i < mappedPts.length; i++) {
                            d += ` L ${mappedPts[i][0]} ${mappedPts[i][1]}`;
                        }
                    }

                    const midPoint = mappedPts[Math.floor(mappedPts.length / 2)];

                    return (
                        <g key={`line-${idx}`} className={`transition-all duration-300 ${isActive || !activeItem ? 'opacity-100' : 'opacity-40'}`}>
                            {/* Outline for line visibility on dark backgrounds */}
                            <path 
                                d={d}
                                fill="none"
                                stroke="#ffffff" 
                                strokeWidth={isActive ? "1.2" : "0.7"}
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="transition-all duration-300"
                            />
                            {/* Thin Black Path to match diagram */}
                            <path 
                                d={d}
                                fill="none"
                                stroke="#000000" 
                                strokeWidth={isActive ? "0.8" : "0.3"}
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="transition-all duration-300"
                            />
                            
                            {/* Text label placed along the line */}
                            <text 
                                x={midPoint[0]} 
                                y={midPoint[1] + (idx % 2 === 0 ? -2 : 3)} 
                                fontSize={isActive ? "2.5" : "2"}
                                stroke="#ffffff"
                                strokeWidth="0.5"
                                strokeLinejoin="round"
                                textAnchor="middle"
                                fontWeight="600"
                                className="transition-all duration-300"
                            >
                                {label}
                            </text>
                            <text 
                                x={midPoint[0]} 
                                y={midPoint[1] + (idx % 2 === 0 ? -2 : 3)} 
                                fontSize={isActive ? "2.5" : "2"}
                                fill="#000000" 
                                textAnchor="middle"
                                fontWeight="600"
                                className="transition-all duration-300"
                            >
                                {label}
                            </text>
                        </g>
                    );
                })}

                {/* Draw Text Labels (Fingers & Zodiac Signs) */}
                {reading.labels?.map((lbl, idx) => {
                    const x = toPctX(lbl.position);
                    const y = toPctY(lbl.position);
                    return (
                        <g key={`lbl-${idx}`}>
                            {/* White outline for text readability */}
                            <text 
                                x={x} 
                                y={y} 
                                fontSize="2"
                                stroke="#ffffff"
                                strokeWidth="0.2"
                                strokeLinejoin="round"
                                textAnchor="middle"
                                fontWeight="600"
                            >
                                {lbl.name}
                            </text>
                            {/* Main Black Text */}
                            <text 
                                x={x} 
                                y={y} 
                                fontSize="2"
                                fill="#000000" 
                                textAnchor="middle"
                                fontWeight="600"
                            >
                                {lbl.name}
                            </text>
                        </g>
                    );
                })}
            </svg>
            )}
        </div>
    );
}
