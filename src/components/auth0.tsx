'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/button';
import { GithubIcon, GoogleIcon, MailIcon, OktaIcon } from '@/components/icons';
import { Input } from '@/components/input';

interface Auth0ButtonProps extends React.ComponentProps<typeof Button> {
  provider: string;
  children: React.ReactNode;
}

const providerIcons: Record<string, React.ComponentType<React.SVGProps<SVGSVGElement>>> = {
  google: GoogleIcon,
  github: GithubIcon,
  mail: MailIcon,
  okta: OktaIcon,
};

const Auth0Button = React.forwardRef<HTMLButtonElement, Auth0ButtonProps>(
  ({ provider, children, className, disabled, ...props }, ref) => {
    return (
      <Button
        ref={ref}
        type="submit"
        variant="outline"
        className={cn(
          // Base styles
          'relative flex w-full items-center justify-start h-[52px] pl-[52px] pr-2 font-normal text-base',
          'bg-white border border-[#c9cace] rounded-[3px] text-[#1e212a]',
          // Hover styles
          'hover:shadow-[inset_0_0_0_150px_rgba(0,0,0,0.1)] hover:bg-white',
          // Focus styles
          'focus-visible:bg-[rgba(226,67,41,0.15)] focus-visible:shadow-[0_0_0_4px_rgba(0,123,173,0.15)] focus-visible:outline-none',
          // Disabled styles
          'disabled:bg-gray-100 disabled:border-gray-100 disabled:text-gray-500 disabled:pointer-events-none',
          // Transition
          'transition-[box-shadow,background-color] duration-150 ease-in-out',
          className,
        )}
        data-provider={provider}
        data-action-button-secondary="true"
        disabled={disabled}
        {...props}
      >
        {/* Provider Icon */}
        <div
          className="absolute left-[26px] top-1/2 -translate-x-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center"
          data-provider={provider}
        >
          {providerIcons[provider] &&
            React.createElement(providerIcons[provider], {
              width: 20,
              height: 20,
            })}
        </div>

        {/* Button Text */}
        <span className="text-left">{children}</span>
      </Button>
    );
  },
);

Auth0Button.displayName = 'Auth0Button';

interface Auth0DividerProps extends React.HTMLAttributes<HTMLDivElement> {
  text?: string;
}

const Auth0Divider = React.forwardRef<HTMLDivElement, Auth0DividerProps>(
  ({ text = 'Or', className, ...props }, ref) => {
    return (
      <div ref={ref} className={cn('flex items-center w-full pt-6', className)} {...props}>
        <div className="flex-1 h-px bg-[#c9cace]" />
        <span className="text-xs font-medium text-[#1e212a] px-4">{text}</span>
        <div className="flex-1 h-px bg-[#c9cace]" />
      </div>
    );
  },
);

Auth0Divider.displayName = 'Auth0Divider';

interface Auth0HeaderProps extends React.HTMLAttributes<HTMLElement> {
  withLogo?: boolean;
  children?: React.ReactNode;
}

const Auth0Header = React.forwardRef<HTMLElement, Auth0HeaderProps>(
  ({ children, withLogo = true, className, ...props }, ref) => {
    return (
      <header
        ref={ref}
        className={cn('block flex-shrink-0 text-center leading-6 px-10 pt-10 pb-6', className)}
        {...props}
      >
        {withLogo && (
          // biome-ignore lint/performance/noImgElement: part of auth0 components
          <img
            src="https://redpanda-ui-static-assets.s3.us-east-2.amazonaws.com/redpanda-text-color.svg"
            alt="Redpanda"
            width={200}
            height={32}
            className="block max-h-8 max-w-full mx-auto"
          />
        )}
        {children}
      </header>
    );
  },
);

Auth0Header.displayName = 'Auth0Header';

interface Auth0InputProps extends React.ComponentProps<typeof Input> {
  placeholder?: string;
}

const Auth0Input = React.forwardRef<HTMLInputElement, Auth0InputProps>(({ className, ...props }, ref) => {
  return (
    <Input
      ref={ref}
      inputMode="email"
      name="username"
      id="username"
      type="text"
      required
      autoComplete="username"
      autoCapitalize="none"
      spellCheck="false"
      className={cn(
        // Base styles - override Shadcn defaults to match Auth0
        'h-[52px] w-full px-4 text-base leading-[1.1] font-[inherit]',
        'bg-white text-black border border-[#c9cace] rounded-[3px]',
        // Focus styles
        'focus-visible:border-[#E24329] focus-visible:shadow-[0_0_0_1px_#E24329] focus-visible:ring-0',
        // Transition
        'transition-[box-shadow,border-color] duration-200 ease-in-out',
        // Remove appearance
        '[-webkit-appearance:none] appearance-none',
        className,
      )}
      style={{
        WebkitAppearance: 'none',
      }}
      {...props}
    />
  );
});

Auth0Input.displayName = 'Auth0Input';

export interface Auth0ModalProps {
  children: React.ReactNode;
  minHeight?: string;
  imageURL?: string;
  isFullscreen?: boolean;
  className?: string;
}

const DEFAULT_BACKGROUND_IMG_URL = 'https://redpanda-ui-static-assets.s3.us-east-2.amazonaws.com/signup.webp';

const Auth0Modal = React.forwardRef<HTMLDivElement, Auth0ModalProps>(
  ({ children, minHeight = '540px', imageURL = DEFAULT_BACKGROUND_IMG_URL, isFullscreen = false, className }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'flex min-h-0 flex-1 flex-col',
          isFullscreen && 'bg-background fixed inset-0 z-50',
          !isFullscreen && 'min-h-screen max-sm:min-h-full h-fit bg-center bg-cover max-sm:bg-white sm:bg-[#F3F3F3]',
          className,
        )}
        style={{
          backgroundImage: !isFullscreen ? `url(${imageURL})` : undefined,
        }}
      >
        <main
          className={cn(
            'grid grid-rows-[1fr] max-sm:grid-cols-1 max-sm:items-start max-sm:justify-start justify-items-center max-sm:gap-x-0 w-full max-sm:w-auto max-sm:p-0 max-sm:m-0 max-sm:min-h-0 h-fit',
            isFullscreen
              ? 'grid-cols-1 items-center justify-center gap-x-0 px-4 py-8 min-h-screen flex-1'
              : 'grid-cols-[1fr_1fr] sm:items-center sm:justify-center gap-x-8 lg:gap-x-20 max-w-screen-xl mx-auto sm:px-8 lg:px-20 sm:min-h-screen',
          )}
        >
          <section
            className={cn(
              'flex flex-col h-auto whitespace-normal relative',
              isFullscreen
                ? 'rounded-lg w-full max-w-md mx-auto'
                : 'max-[500px]:rounded-none sm:rounded-[5px] max-[500px]:w-screen sm:w-[400px] max-sm:col-span-1 sm:col-start-1',
            )}
          >
            <div
              className={cn(
                'flex flex-col overflow-hidden relative text-base text-[#1e212a] bg-white border-0 border-transparent',
                isFullscreen
                  ? 'flex-grow rounded-lg shadow-lg'
                  : 'max-sm:flex-grow max-sm:shadow-none sm:shadow-[0_12px_40px_rgba(0,0,0,0.12)] max-sm:rounded-none sm:rounded-[5px]',
              )}
            >
              <div
                className={cn(
                  'flex flex-col relative',
                  isFullscreen ? 'flex-grow justify-center p-6' : 'flex-grow max-sm:justify-start sm:justify-center',
                )}
                style={{ minHeight: !isFullscreen ? minHeight : undefined }}
              >
                {children}
              </div>
            </div>
          </section>
        </main>
      </div>
    );
  },
);

Auth0Modal.displayName = 'Auth0Modal';

interface Auth0ModalBodyProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

const Auth0ModalBody = React.forwardRef<HTMLDivElement, Auth0ModalBodyProps>(
  ({ children, className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'text-sm font-normal px-10 pb-10 text-center flex-shrink-0 m-0 border-0 align-baseline',
          className,
        )}
        {...props}
      >
        {children}
      </div>
    );
  },
);

Auth0ModalBody.displayName = 'Auth0ModalBody';

interface Auth0ModalDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {
  children: React.ReactNode;
}

const Auth0ModalDescription = React.forwardRef<HTMLParagraphElement, Auth0ModalDescriptionProps>(
  ({ children, className, ...props }, ref) => {
    return (
      <p
        ref={ref}
        className={cn('inline text-sm font-normal text-center', className)}
        style={{
          marginBlockStart: '1em',
          marginBlockEnd: '1em',
          marginInlineStart: '0px',
          marginInlineEnd: '0px',
          WebkitFontSmoothing: 'antialiased',
        }}
        {...props}
      >
        {children}
      </p>
    );
  },
);

Auth0ModalDescription.displayName = 'Auth0ModalDescription';

interface Auth0ModalHeadingProps extends React.HTMLAttributes<HTMLHeadingElement> {
  children: React.ReactNode;
}

const Auth0ModalHeading = React.forwardRef<HTMLHeadingElement, Auth0ModalHeadingProps>(
  ({ children, className, ...props }, ref) => {
    return (
      <h1
        ref={ref}
        className={cn('my-6 mb-4 text-2xl font-normal tracking-normal text-[#1e212a] text-center', className)}
        {...props}
      >
        {children}
      </h1>
    );
  },
);

Auth0ModalHeading.displayName = 'Auth0ModalHeading';

interface Auth0ModalLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  children: React.ReactNode;
}

const Auth0ModalLink = React.forwardRef<HTMLAnchorElement, Auth0ModalLinkProps>(
  ({ children, className, ...props }, ref) => {
    return (
      <a
        ref={ref}
        className={cn('text-sm font-bold rounded-[3px] p-1 text-[#E24329] no-underline hover:no-underline', className)}
        {...props}
      >
        {children}
      </a>
    );
  },
);

Auth0ModalLink.displayName = 'Auth0ModalLink';

interface Auth0ModalTextProps extends React.HTMLAttributes<HTMLParagraphElement> {
  children: React.ReactNode;
}

const Auth0ModalText = React.forwardRef<HTMLParagraphElement, Auth0ModalTextProps>(
  ({ children, className, ...props }, ref) => {
    return (
      <p
        ref={ref}
        className={cn('block text-left text-[#1e212a] whitespace-normal text-sm antialiased mt-4 mb-0 mx-0', className)}
        {...props}
      >
        {children}
      </p>
    );
  },
);

Auth0ModalText.displayName = 'Auth0ModalText';

interface Auth0SubmitButtonProps extends React.ComponentProps<typeof Button> {
  children: React.ReactNode;
}

const Auth0SubmitButton = React.forwardRef<HTMLButtonElement, Auth0SubmitButtonProps>(
  ({ children, className, ...props }, ref) => {
    return (
      <Button
        ref={ref}
        type="submit"
        name="action"
        value="default"
        data-action-button-primary="true"
        className={cn(
          'mt-6 text-base font-normal bg-[#E24329] flex items-center justify-center relative w-full px-4 py-1 min-h-[52px] font-[inherit] outline-none cursor-pointer text-white border-0 rounded-[3px]',
          'hover:bg-[#d03c38]',
          'transition-[background-color,box-shadow] duration-250 ease-in-out',
          className,
        )}
        {...props}
      >
        {children}
      </Button>
    );
  },
);

Auth0SubmitButton.displayName = 'Auth0SubmitButton';

export {
  Auth0Button,
  Auth0Divider,
  Auth0Header,
  Auth0Input,
  Auth0Modal,
  Auth0ModalBody,
  Auth0ModalDescription,
  Auth0ModalHeading,
  Auth0ModalLink,
  Auth0ModalText,
  Auth0SubmitButton,
};
