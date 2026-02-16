"use client";

import { Link } from "@heroui/link";
import { Input } from "@heroui/input";
import { Button } from "@heroui/button";
import { siteConfig } from "@/config/site";
import { Logo, GithubIcon, TwitterIcon, DiscordIcon } from "@/components/icons";

export const Footer = () => {
    return (
        <footer className="w-full bg-background border-t border-divider">
            <div className="mx-auto w-full max-w-7xl px-6 py-12 lg:px-8">
                <div className="xl:grid xl:grid-cols-3 xl:gap-8">
                    {/* Brand Section */}
                    <div className="space-y-8">
                        <div className="flex items-center gap-2">
                            <Logo size={40} />
                            <span className="text-xl font-bold">HireMe</span>
                        </div>
                        <p className="text-small text-default-500 max-w-sm">
                            Local-first job outreach automation with human review and AI-powered personalization.
                            Automate your job hunt without losing the human touch.
                        </p>
                        <div className="flex space-x-6">
                            <Link isExternal aria-label="Github" href={siteConfig.links.github}>
                                <GithubIcon className="text-default-500 hover:text-foreground transition-colors" />
                            </Link>
                            <Link isExternal aria-label="Twitter" href={siteConfig.links.twitter}>
                                <TwitterIcon className="text-default-500 hover:text-foreground transition-colors" />
                            </Link>
                            <Link isExternal aria-label="Discord" href={siteConfig.links.discord}>
                                <DiscordIcon className="text-default-500 hover:text-foreground transition-colors" />
                            </Link>
                        </div>
                    </div>

                    {/* Links Section */}
                    <div className="mt-16 grid grid-cols-2 gap-8 xl:col-span-2 xl:mt-0">
                        <div className="md:grid md:grid-cols-2 md:gap-8">
                            <div>
                                <h3 className="text-small font-semibold text-foreground">Services</h3>
                                <ul className="mt-4 space-y-4">
                                    {siteConfig.navItems.slice(0, 4).map((item) => (
                                        <li key={item.href}>
                                            <Link color="foreground" href={item.href} className="text-small text-default-500 hover:text-foreground transition-colors">
                                                {item.label}
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div className="mt-10 md:mt-0">
                                <h3 className="text-small font-semibold text-foreground">Resources</h3>
                                <ul className="mt-4 space-y-4">
                                    {siteConfig.navMenuItems.map((item) => (
                                        <li key={item.href}>
                                            <Link color="foreground" href={item.href} className="text-small text-default-500 hover:text-foreground transition-colors">
                                                {item.label}
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                        <div className="md:grid md:grid-cols-1 md:gap-8">
                            <div>
                                <h3 className="text-small font-semibold text-foreground">Subscribe to our newsletter</h3>
                                <p className="mt-4 text-small text-default-500">
                                    The latest news, articles, and resources, sent to your inbox weekly.
                                </p>
                                <form className="mt-6 flex max-w-md gap-x-4">
                                    <Input
                                        labelPlacement="outside"
                                        placeholder="Enter your email"
                                        type="email"
                                        className="flex-auto"
                                    />
                                    <Button color="primary" type="submit">
                                        Subscribe
                                    </Button>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="mt-16 border-t border-divider pt-8 sm:mt-20 lg:mt-24">
                    <p className="text-small leading-5 text-default-500">
                        &copy; {new Date().getFullYear()} {siteConfig.developer.name}. All rights reserved.
                    </p>
                </div>
            </div>
        </footer>
    );
};
