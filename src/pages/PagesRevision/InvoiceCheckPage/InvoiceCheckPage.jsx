////hooks
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";

////fns
import { changeListActionLeftovers } from "../../../store/reducers/requestSlice";
import { getLeftoversForCheck } from "../../../store/reducers/requestSlice";
import { sendCheckListProduct } from "../../../store/reducers/requestSlice";

///// components
import ConfirmationModal from "../../../common/ConfirmationModal/ConfirmationModal";

///// helpers
import { totalSumRevision } from "../../../helpers/amounts";
import ResultCounts from "../../../common/ResultCounts/ResultCounts";

////style
import "./style.scss";
import TablesRevision from "../../../components/Tables/TablesRevision/TablesRevision";
import NavMenu from "../../../common/NavMenu/NavMenu";

const InvoiceCheckPage = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const navigate = useNavigate();

  const { invoice_guid, guidWorkShop, seller_guid_to } = location.state;
  //// список товаров для ревизии

  const [modalSend, setModalSend] = useState(false);

  const { listActionLeftovers } = useSelector((state) => state.requestSlice);

  useEffect(() => {
    getData();
    window.scrollTo({ top: 0, behavior: "smooth" });

    return () => {
      dispatch(changeListActionLeftovers([]));
    };
    ///// очищаю список товаров, которые я отпрвляю для ревизии
  }, []);

  const getData = async () => {
    const obj = { seller_guid: seller_guid_to, guidWorkShop };
    await dispatch(getLeftoversForCheck(obj));
    /// get остатки разделенные по цехам для ревизии
  };

  const closeModal = () => setModalSend(false);

  const sendData = () => {
    //////////////////////////////////////////////
    const products = listActionLeftovers?.map((props) => {
      const { guid, price, change_end_outcome, unit_codeid } = props;
      return { guid, price, count: change_end_outcome, unit_codeid };
    });

    const data = { invoice_guid, products };
    dispatch(sendCheckListProduct({ data, navigate }));
    closeModal();
  };

  const noneData = listActionLeftovers?.length === 0;

  return (
    <>
      <NavMenu navText={"Накладная для ревизия"} />
      <div className="invoiceRevision">
        <div className="invoiceRevision__inner">
          <TablesRevision arr={listActionLeftovers} />
          <div className="actionBlockRes">
            {!noneData && (
              <div>
                <ResultCounts list={listActionLeftovers} />
                <p className="totalItemCount">
                  Сумма: {totalSumRevision(listActionLeftovers) || 0} сом
                </p>
              </div>
            )}
            {noneData ? (
              <p className="noneData">Список пустой</p>
            ) : (
              <button onClick={() => setModalSend(true)}>
                Сформировать накладную
              </button>
            )}
          </div>
        </div>

        <ConfirmationModal
          visible={modalSend}
          message="Сформировать накладную для ревизии товара ?"
          onYes={sendData}
          onNo={closeModal}
          onClose={closeModal}
        />
      </div>
    </>
  );
};

export default InvoiceCheckPage;
