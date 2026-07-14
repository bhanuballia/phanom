
import React, { useEffect } from 'react';

const WebTritWidget = () => {
    useEffect(() => {
        console.log('WebTritWidget: Component mounted');

        // Check if widget is already injected
        if (document.getElementById('CallbuttonWidget') || document.getElementById('CallButtonWidget')) {
            console.warn('WebTritWidget: Widget already exists in DOM');
            return;
        }

        // Load CSS
        if (!document.querySelector('link[href*="webtrit/src/widget.css"]')) {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = '/webtrit/src/widget.css?v=' + Date.now();
            document.head.appendChild(link);
            console.log('WebTritWidget: CSS added');
        }

        // Load Widget Script
        const script = document.createElement('script');
        script.type = 'module';
        script.src = '/webtrit/widget.js?v=' + Date.now();
        script.async = true;
        // script.crossOrigin = 'anonymous'; // Removed to avoid CORS issues if not needed

        script.onload = () => {
            console.log('WebTritWidget: Script loaded successfully');
            // Wait a bit and check if button appeared
            setTimeout(() => {
                const btn = document.getElementById('CallbuttonWidget') || document.getElementById('CallButtonWidget');
                console.log('WebTritWidget: Button check after 1s:', btn ? 'Found' : 'NOT FOUND');
            }, 1000);
        };

        script.onerror = (err) => {
            console.error('WebTritWidget: Failed to load script', err);
        };

        document.body.appendChild(script);

        return () => {
            console.log('WebTritWidget: Component unmounting');
        };
    }, []);

    return (
        <div id="webtrit-integration-container" style={{ display: 'none' }}>
            {/* Hidden div for Vue app to mount if it insists on #app */}
            <div id="app"></div>
        </div>
    );
};

export default WebTritWidget;

