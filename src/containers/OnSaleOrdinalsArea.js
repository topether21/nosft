/* eslint-disable react/forbid-prop-types */
/* eslint-disable no-restricted-syntax */
/* eslint-disable no-extra-boolean-cast */
import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import clsx from "clsx";
import SectionTitle from "@components/section-title";
import OrdinalCard from "@components/ordinal-card";
import { deepClone } from "@utils/methods";
import OpenOrdex from "@utils/openOrdex";
import SessionStorage, { SessionsStorageKeys } from "@services/session-storage";
import { useWallet } from "@context/wallet-context";

const collectionAuthor = [
    {
        name: "Danny Deezy",
        slug: "/deezy",
        image: {
            src: "/images/logo/nos-ft-logo.png",
        },
    },
];

const OnSaleOrdinalsArea = ({ className, space, onConnectHandler, onSale }) => {
    const { nostrAddress, isExperimental } = useWallet();
    const [openOrders, setOpenOrders] = useState([]);
    const [isLoadingOpenOrders, setIsLoadingOpenOrders] = useState(true);

    useEffect(() => {
        // safe on session storage for faster loads
        window.addEventListener("message", (event) => {
            console.debug(event);
        });
        const load = async () => {
            setIsLoadingOpenOrders(true);
            // load from cache before updating
            const sessionOrders = SessionStorage.get(SessionsStorageKeys.INSCRIPTIONS_ON_SALE);
            if (sessionOrders) {
                setOpenOrders(sessionOrders);
            }
            const openOrderx = await OpenOrdex.init();
            const orders = await openOrderx.getLatestOrders(25);

            const forSaleInscriptions = [];
            for (const inscription of orders) {
                let inscriptionData = inscription.tags
                    // .filter(([t, v]) => t === "i" && v)
                    .map(([tagId, value]) => ({
                        [tagId]: value,
                    }));
                // Convert array into object of key tagId
                inscriptionData = Object.assign({}, ...inscriptionData.map((o) => o));

                const i = deepClone({
                    inscriptionTags: inscriptionData,
                    ...inscription,
                });

                forSaleInscriptions.push(i);
            }

            SessionStorage.set(SessionsStorageKeys.INSCRIPTIONS_ON_SALE, forSaleInscriptions);

            setOpenOrders(forSaleInscriptions);

            setIsLoadingOpenOrders(false);
        };
        load();
    }, []);

    return (
        <div id="selling-collection" className={clsx("rn-product-area", space === 1 && "rn-section-gapTop", className)}>
            <div className="container">
                <div className="row mb--50 align-items-center">
                    <div className="col-lg-6 col-md-6 col-sm-6 col-12">
                        <SectionTitle
                            className="mb--0 with-loading"
                            isLoading={isLoadingOpenOrders}
                            {...{ title: "On sale" }}
                        />
                        {!Boolean(nostrAddress) && isExperimental && (
                            <span>
                                <button type="button" className="btn-transparent" onClick={onConnectHandler}>
                                    Connect
                                </button>{" "}
                                your wallet to buy an inscription
                            </span>
                        )}
                    </div>
                </div>

                {!!openOrders.length && (
                    <div className="row g-5">
                        {openOrders.length > 0 ? (
                            <>
                                {openOrders.map((utxo) => (
                                    <div key={utxo.id} className="col-5 col-lg-4 col-md-6 col-sm-6 col-12">
                                        <OrdinalCard
                                            overlay
                                            price={{
                                                amount: utxo.value.toLocaleString("en-US"),
                                                currency: "Sats",
                                            }}
                                            type="buy"
                                            confirmed
                                            date={utxo.created_at}
                                            authors={collectionAuthor}
                                            utxo={utxo}
                                            onSale={onSale}
                                        />
                                    </div>
                                ))}
                            </>
                        ) : (
                            <div>There are no inscriptions for sale yet..</div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

OnSaleOrdinalsArea.propTypes = {
    className: PropTypes.string,
    space: PropTypes.oneOf([1, 2]),
    onClick: PropTypes.func,
    onSale: PropTypes.func,
    onConnectHandler: PropTypes.func,
};

OnSaleOrdinalsArea.defaultProps = {
    space: 1,
};

export default OnSaleOrdinalsArea;
