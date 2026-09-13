/* The new static design owns navigation; preserve reference anchors only. */
(function(){
 'use strict';
 const items=[];
 const desktop=document.querySelectorAll('.desktop-nav .nav-panel')[1];
 const mobile=document.querySelector('.mobile-nav');
 for(const [label,url] of items){
   if(desktop){const a=document.createElement('a');a.className='claude-extra';a.href=url;a.textContent=label;desktop.append(a);}
   if(mobile){const a=document.createElement('a');a.className='mobile-direct claude-extra';a.href=url;a.textContent=label;mobile.prepend(a);}
 }
 const resources=document.querySelectorAll('.site-footer .footer-column')[2];
 if(resources)for(const [label,url]of items){const a=document.createElement('a');a.href=url;a.textContent=label;resources.append(a);}
 function revealReference(){const id=decodeURIComponent(location.hash.slice(1));if(!id)return;const target=document.getElementById(id);const reference=target&&target.closest('details.legacy-reference');if(reference){reference.open=true;target.scrollIntoView();}}
 window.addEventListener('hashchange',revealReference);revealReference();
})();
