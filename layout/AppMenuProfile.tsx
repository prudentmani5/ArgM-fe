import { classNames } from 'primereact/utils';
import React, { use, useContext, useEffect, useRef, useState } from 'react';
import { Tooltip } from 'primereact/tooltip';
import { LayoutContext } from './context/layoutcontext';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import { AppUser } from '../app/(AgrM-fe)/usermanagement/AppUser';
import { json } from 'stream/consumers';

const AppMenuProfile = () => {
    const { layoutState, layoutConfig, isSlim, isHorizontal, onMenuProfileToggle } = useContext(LayoutContext);
    const router = useRouter();
    const ulRef = useRef<HTMLUListElement | null>(null);
    const [appUser, setAppUser] = useState<AppUser>(null);
    

    useEffect(() => {
        const appUser = Cookies.get('appUser');
        console.log('AppUser from cookies: ' + appUser);
        // If appUser is not null, parse it and set it to state
        if (appUser) {
            setAppUser(JSON.parse(appUser));
        } 
    },[]);
    const hiddenClassName = classNames({ hidden: layoutConfig.menuMode === 'drawer' && !layoutState.sidebarActive });

    const toggleMenu = () => {
        if (layoutState.menuProfileActive) {
            setTimeout(() => {
                (ulRef.current as any).style.maxHeight = '0';
            }, 1);
            (ulRef.current as any).style.opacity = '0';
            if (isHorizontal()) {
                (ulRef.current as any).style.transform = 'scaleY(0.8)';
            }
        } else {
            setTimeout(() => {
                (ulRef.current as any).style.maxHeight = (ulRef.current as any).scrollHeight.toString() + 'px';
            }, 1);
            (ulRef.current as any).style.opacity = '1';
            if (isHorizontal()) {
                (ulRef.current as any).style.transform = 'scaleY(1)';
            }
        }
        onMenuProfileToggle();
    };

    const tooltipValue = (tooltipText: string) => {
        return isSlim() ? tooltipText : null;
    };

    function handleLogout() {
        Cookies.remove('token');
        Cookies.remove('appUser');
        Cookies.remove('XSRF-TOKEN');
        Cookies.remove('currentExercice');
        // Use window.location.href instead of router.push to avoid chunk loading errors
        // This performs a full page reload, ensuring fresh chunks are loaded
        window.location.href = '/auth/login2';
    }

    return (
        // <React.Fragment>
        //     <div className="layout-menu-profile">
        //         <Tooltip target={'.avatar-button'} content={tooltipValue('Profile') as string} />
        //         <button className="avatar-button p-link" onClick={toggleMenu}>
        //             <img src="/layout/images/avatar/amyelsner.png" alt="avatar" style={{ width: '32px', height: '32px' }} />
        //             <span>
        //                 {appUser && (<strong>{appUser.fullName}</strong>)}   
        //                 {/* <small>Webmaster</small> */}
        //             </span>
        //             <i
        //                 className={classNames('layout-menu-profile-toggler pi pi-fw', {
        //                     'pi-angle-down': layoutConfig.menuProfilePosition === 'start' || isHorizontal(),
        //                     'pi-angle-up': layoutConfig.menuProfilePosition === 'end' && !isHorizontal()
        //                 })}
        //             ></i>
        //         </button>

        //         <ul ref={ulRef} className={classNames('menu-transition', { overlay: isHorizontal() })} style={{ overflow: 'hidden', maxHeight: 0, opacity: 0 }}>
        //             {layoutState.menuProfileActive && (
        //                 <>
        //                     {/* <li>
        //                         <button className="p-link" onClick={() => router.push('/documentation')}>
        //                             <i className="pi pi-cog pi-fw"></i>
        //                             <span className={hiddenClassName}>Settings</span>
        //                         </button>
        //                     </li> */}

        //                     {/* <li>
        //                         <button className="p-link" onClick={() => router.push('/documentation')}>
        //                             <i className="pi pi-file-o pi-fw"></i>
        //                             <span className={hiddenClassName}>Profile</span>
        //                         </button>
        //                     </li> */}
        //                     {/* <li>
        //                         <button className="p-link" onClick={() => router.push('/documentation')}>
        //                             <i className="pi pi-compass pi-fw"></i>
        //                             <span className={hiddenClassName}>Support</span>
        //                         </button>
        //                     </li> */}
        //                     <li>
        //                         <button className="p-link" onClick={handleLogout}>
        //                             <i className="pi pi-power-off pi-fw"></i>
        //                             <span className={hiddenClassName}>Logout</span>
        //                         </button>
        //                     </li>
        //                 </>
        //             )}
        //         </ul>
        //     </div>
        // </React.Fragment>

        <> </>
    );
};

export default AppMenuProfile;
