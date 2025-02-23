/* eslint-disable no-restricted-syntax, no-await-in-loop, no-continue */

import React, { useRef } from "react";
import Wrapper from "@layout/wrapper";
import Header from "@layout/header";
import Footer from "@layout/footer";
import SEO from "@components/seo";
import HeroArea from "@containers/HeroArea";
import OrdinalsArea from "@containers/OrdinalsArea";
import { normalizedData } from "@utils/methods";
import homepageData from "@data/general/home.json";

import NostrLive from "@containers/NostrLive";
import { useWalletState } from "src/hooks/use-wallet-state";
import { WalletContext } from "@context/wallet-context";
import useHeaderHeight from "src/hooks/use-header-height";

export async function getStaticProps() {
    return { props: { className: "template-color-1" } };
}

const App = () => {
    const walletState = useWalletState();
    const { nostrPublicKey, nostrAddress } = walletState;
    const elementRef = useRef(null);
    const headerHeight = useHeaderHeight(elementRef);

    const content = normalizedData(homepageData?.content || []);

    return (
        <WalletContext.Provider value={walletState}>
            <Wrapper>
                <SEO pageTitle="Deezy" />
                <Header ref={elementRef} />
                <main id="main-content" style={{ paddingTop: headerHeight }}>
                    {!nostrPublicKey && <HeroArea data={content["hero-section"]} />}

                    {nostrPublicKey && nostrAddress && <NostrLive />}
                    {nostrPublicKey && nostrAddress && <OrdinalsArea />}
                </main>

                <Footer />
            </Wrapper>
        </WalletContext.Provider>
    );
};

export default App;
