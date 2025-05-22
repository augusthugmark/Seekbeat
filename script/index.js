'use strict';  

document.addEventListener("DOMContentLoaded", () => {
            const elements = document.querySelectorAll('.fade-up');
            elements.forEach((el, index) => {
            setTimeout(() => {
                el.classList.add('show');
            }, index * 100);
            });
        });